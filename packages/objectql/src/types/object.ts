import { Dictionary, JsonMap } from "@salesforce/ts-types";
import { SteedosActionType, SteedosTriggerType, SteedosFieldType, SteedosFieldTypeConfig, SteedosSchema, SteedosListenerConfig, SteedosObjectListViewTypeConfig, SteedosObjectListViewType, SteedosIDType, SteedosObjectPermissionTypeConfig } from ".";
import _ = require("underscore");
import { SteedosTriggerTypeConfig, SteedosTriggerContextConfig } from "./trigger";
import { SteedosQueryOptions } from "./query";
import { SteedosDataSourceType, SteedosDatabaseDriverType } from "./datasource";

abstract class SteedosObjectProperties {
    name?: string
    // extend?: string
    tableName?: string
    label?: string
    icon?: string
    enable_search?: boolean
    is_enable?: boolean
    enable_files?: boolean
    enable_tasks?: boolean
    enable_notes?: boolean
    enable_events?: boolean
    enable_api?: boolean
    enable_share?: boolean
    enable_instances?: boolean
    enable_chatter?: boolean
    enable_audit?: boolean
    enable_trash?: boolean
    enable_space_global?: boolean
    enable_tree?: boolean
    is_view?: boolean
    hidden?: boolean
    description?: string
    custom?: boolean
    owner?: string
    // triggers?: object
    sidebar?: object //TODO
    calendar?: object //TODO
    actions?: Dictionary<SteedosActionType> //TODO
    fields?: Dictionary<SteedosFieldTypeConfig>
    listeners?: Dictionary<SteedosListenerConfig>
    list_views?: Dictionary<SteedosObjectListViewTypeConfig>
    permissions?: Dictionary<SteedosObjectPermissionTypeConfig>
}



export interface SteedosObjectTypeConfig extends SteedosObjectProperties {
    name?: string
    fields: Dictionary<SteedosFieldTypeConfig>
    actions?: Dictionary<SteedosActionType>
    listeners?: Dictionary<SteedosListenerConfig>
    permission_set?: Dictionary<SteedosObjectPermissionTypeConfig> //TODO remove ; 目前为了兼容现有object的定义保留
}

const _TRIGGERKEYS = ['beforeInsert', 'beforeUpdate', 'beforeDelete', 'afterInsert', 'afterUpdate', 'afterDelete']

const properties = ['label','icon','enable_search','is_enable','enable_files','enable_tasks','enable_notes','enable_events','enable_api','enable_share','enable_instances','enable_chatter','enable_audit','enable_trash','enable_space_global','enable_tree','is_view','hidden','description','custom','owner']

export class SteedosObjectType extends SteedosObjectProperties {

    private _schema: SteedosSchema;
    private _datasource: SteedosDataSourceType;
    private _name: string;
    private _fields: Dictionary<SteedosFieldType> = {};
    private _actions: Dictionary<SteedosActionType> = {};
    private _listeners: Dictionary<SteedosListenerConfig> = {};
    private _triggers: Dictionary<SteedosTriggerType> = {};
    private _list_views: Dictionary<SteedosObjectListViewType> = {};
    private _tableName: string;
    private _triggersQueue: Dictionary<Dictionary<SteedosTriggerType>> = {}
    private _idField: SteedosFieldType;

    public get idField(): SteedosFieldType {
        return this._idField;
    }

    constructor(object_name: string, datasource: SteedosDataSourceType, config: SteedosObjectTypeConfig) {
        super();
        this._name = object_name
        this._datasource = datasource
        this._schema = datasource.schema

        if (/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(object_name) != true) {
            throw new Error('invalid character, object_name can only be start with _ or a-zA-Z and contain only _ or _a-zA-Z0-9. you can set table_name');
        }

        if (config.tableName) {
            this._tableName = config.tableName
        } else {
            this._tableName = this._name
        }

        _.each(properties, (property)=>{
            if(_.has(config, property)){
                this[property] = config[property]
            }
        })

        _.each(config.fields, (field, field_name) => {
            this.setField(field_name, field)
        })

        this._actions = config.actions

        _.each(config.listeners, (listener, listener_name) => {
            this.setListener(listener_name, listener)
        })

        _.each(config.list_views, (list_view, name) => {
            this.setListView(name, list_view)
        })

        _.each(config.permissions, (permission, name) => {
            permission.name = name
            this.setPermission(permission)
        })

        //TODO remove ; 目前为了兼容现有object的定义保留
        _.each(config.permission_set, (permission, name) => {
            permission.name = name
            this.setPermission(permission)
        })
    }

    setPermission(config: SteedosObjectPermissionTypeConfig) {
        this._datasource.setObjectPermission(this._name, config)
    }

    setListener(listener_name: string, config: SteedosListenerConfig) {
        this.listeners[listener_name] = config
        _TRIGGERKEYS.forEach((key) => {
            let event = config[key];
            if (_.isFunction(event)) {
                this.setTrigger(`${listener_name}_${event.name}`, event.name, event);
            }
        })
    }

    private setTrigger(name: string, when: string, todo: Function, on = 'server') {
        let triggerConfig: SteedosTriggerTypeConfig = {
            name: name,
            on: on,
            when: when,
            todo: todo,
        }
        let trigger = new SteedosTriggerType(triggerConfig)
        this.triggers[name] = trigger
        this.registerTrigger(trigger)
    }

    registerTrigger(trigger: SteedosTriggerType) {
        //如果是meteor mongo 则不做任何处理
        if(!_.isString(this._datasource.driver) || this._datasource.driver != SteedosDatabaseDriverType.MeteorMongo){
            if (!this._triggersQueue[trigger.when]) {
                this._triggersQueue[trigger.when] = {}
            }
            this._triggersQueue[trigger.when][trigger.name] = trigger
        }
    }

    unregisterTrigger(trigger: SteedosTriggerType) {
        delete this._triggersQueue[trigger.when][trigger.name]
    }

    private async runTirgger(trigger: SteedosTriggerType, context: SteedosTriggerContextConfig) {
        let object_name = this.name
        let event = trigger.todo
        let todoWrapper = async function () {
            // Object.setPrototypeOf(thisArg, Object.getPrototypeOf(trigger))
            return await event.apply(thisArg, arguments)
        }
        let thisArg = {
            userId: context.userId, object_name: object_name, getObject: (object_name: string) => {
                return this._schema.getObject(object_name)
            }
        }

        return await todoWrapper.call(thisArg, context.userId, context)
    }

    async runTriggers(when: string, context: SteedosTriggerContextConfig) {
        let triggers = this._triggersQueue[when]
        if(!triggers){
            return ;
        }

        let triggerKeys = _.keys(triggers)

        for (let index = 0; index < triggerKeys.length; index++) {
            let trigger = triggers[triggerKeys[index]];
            await this.runTirgger(trigger, context)
        }
    }

    toConfig() {
        let config: JsonMap = {
            name: this.name,
            fields: {}
        }

        _.each(properties, (property)=>{
            if(this[property] != null && this[property] != undefined){
                config[property] = this[property]
            }
        })

        if (this.fields) {
            config.fields = {}
            _.each(this.fields, (field: SteedosFieldType, key: string) => {
                config.fields[key] = field.toConfig();
            })
        }

        if(this.triggers){
            config.triggers = {}
            _.each(this.triggers, (trigger: SteedosTriggerType, key: string)=>{
                config.triggers[key] = trigger.toConfig();
            })
        }

        let rolePermission = this.getObjectRolesPermission()
        if(rolePermission){
            config.permission_set = {}
            _.each(rolePermission, (v, k)=>{
                config.permission_set[k] = v
            })
        }

        return config
    }

    setField(field_name: string, fieldConfig: SteedosFieldTypeConfig) {
        let field = new SteedosFieldType(field_name, this, fieldConfig)
        this.fields[field_name] = field

        if(field.primary && this._datasource.driver != SteedosDatabaseDriverType.Mongo && this._datasource.driver != SteedosDatabaseDriverType.MeteorMongo){
            this._idField = field
        }
    }

    getField(field_name: string) {
        return this.fields[field_name]
    }

    setListView(list_view_name: string, config: SteedosObjectListViewTypeConfig) {
        this.list_views[list_view_name] = new SteedosObjectListViewType(list_view_name, this, config)
    }

    //TODO 处理对象继承
    extend(config: SteedosObjectTypeConfig) {
        if (this.name != config.name)
            throw new Error("You can not extend on different object");

        // override each fields
        _.each(config.fields, (field, field_name) => {
            this.setField(field_name, field)
        })

        // override each actions
        if (config.actions) {
            _.each(config.actions, (action) => {
                this.actions[action.name] = action
            })
        }

        // override each triggers
        // if (config.triggers) {
        //     _.each(config.triggers, (trigger) => {
        //         this.triggers[trigger.name] = trigger
        //     })
        // }
    }

    getObjectRolesPermission() {
        return this._datasource.getObjectRolesPermission(this._name)
    }

    async getUserObjectPermission(userId: SteedosIDType) {
        let roles = await this.schema.getRoles(userId)
        let objectRolesPermission = this.getObjectRolesPermission()

        let userObjectPermission = {
            allowRead: false,
            allowCreate: false,
            allowEdit: false,
            allowDelete: false,
            viewAllRecords: false,
            modifyAllRecords: false,
            viewCompanyRecords: false,
            modifyCompanyRecords: false,
            disabled_list_views: [],
            disabled_actions: [],
            unreadable_fields: [],
            uneditable_fields: [],
            unrelated_objects: []
        }

        if (_.isEmpty(roles)) {
            throw new Error('not find user permission');
        }

        roles.forEach((role) => {
            let rolePermission = objectRolesPermission[role]
            if (rolePermission) {
                _.each(userObjectPermission, (v, k) => {
                    let _v = rolePermission[k]
                    if (_.isBoolean(v)) {
                        if (v === false && _v === true) {
                            userObjectPermission[k] = _v
                        }
                    } else if (_.isArray(v) && _.isArray(_v)) {
                        userObjectPermission[k] = _.union(v, _v)
                    }
                })
            }
        })
        return userObjectPermission;
    }

    private async allowFind(userId: SteedosIDType) {
        if (!userId)
            return true
        let userObjectPermission = await this.getUserObjectPermission(userId)
        if (userObjectPermission.allowRead) {
            return true
        } else {
            return false
        }
    }

    private async allowInsert(userId: SteedosIDType) {
        if (!userId)
            return true
        let userObjectPermission = await this.getUserObjectPermission(userId)
        if (userObjectPermission.allowCreate) {
            return true
        } else {
            return false
        }
    }

    private async allowUpdate(userId: SteedosIDType) {
        if (!userId)
            return true
        let userObjectPermission = await this.getUserObjectPermission(userId)
        if (userObjectPermission.allowEdit) {
            return true
        } else {
            return false
        }
    }

    private async allowDelete(userId: SteedosIDType) {
        if (!userId)
            return true
        let userObjectPermission = await this.getUserObjectPermission(userId)
        if (userObjectPermission.allowDelete) {
            return true
        } else {
            return false
        }
    }

    async find(query: SteedosQueryOptions, userId?: SteedosIDType) {
        await this.processUnreadableField(userId, query);
        return await this.callAdapter('find', this.name, query, userId)
    }

    async findOne(id: SteedosIDType, query: SteedosQueryOptions, userId?: SteedosIDType) {
        await this.processUnreadableField(userId, query);
        return await this.callAdapter('findOne', this.tableName, id, query, userId)
    }

    async insert(doc: JsonMap, userId?: SteedosIDType) {
        return await this.callAdapter('insert', this.tableName, doc, userId)
    }

    async update(id: SteedosIDType, doc: JsonMap, userId?: SteedosIDType) {
        return await this.callAdapter('update', this.tableName, id, doc, userId)
    }

    async delete(id: SteedosIDType, userId?: SteedosIDType) {
        return await this.callAdapter('delete', this.tableName, id, userId)
    }

    async count(query: SteedosQueryOptions, userId?: SteedosIDType) {
        return await this.callAdapter('count', this.tableName, query, userId)
    }

    private async allow(method: string, userId: SteedosIDType) {
        if (_.isNull(userId) || _.isUndefined(userId)) {
            return true
        }
        if (method === 'find' || method === 'findOne' || method === 'count') {
            return await this.allowFind(userId)
        } else if (method === 'insert') {
            return await this.allowInsert(userId)
        } else if (method === 'update') {
            return await this.allowUpdate(userId)
        } else if (method === 'delete') {
            return await this.allowDelete(userId)
        }
    }

    private async runBeforeTriggers(method: string, context: SteedosTriggerContextConfig) {
        let when = `before${method.charAt(0).toLocaleUpperCase()}${_.rest([...method]).join('')}`
        return await this.runTriggers(when, context)
    }

    private async runAfterTriggers(method: string, context: SteedosTriggerContextConfig){
        let when = `after${method.charAt(0).toLocaleUpperCase()}${_.rest([...method]).join('')}`
        return await this.runTriggers(when, context)
    }

    private async getTriggerContext(when: string, method: string, args: any[]) {

        let context: SteedosTriggerContextConfig = { userId: args[args.length - 1] }

        if (method === 'find' || method === 'findOne' || method === 'count') {
            context.query = args[args.length - 2]
        }

        if (method === 'findOne' || method === 'update' || method === 'delete') {
            context.id = args[1]
        }

        if (method === 'insert' || method === 'update') {
            context.doc = args[args.length - 2]
        }

        if(when === 'after' && (method === 'update' || method === 'delete')){
            context.previousDoc = await this.findOne(context.id, {}, context.userId)
        }

        return context
    }

    private async processUnreadableField(userId: SteedosIDType, query: SteedosQueryOptions){
        let userObjectPermission = await this.getUserObjectPermission(userId)
        let userObjectUnreadableFields = userObjectPermission.unreadable_fields
        if(userObjectUnreadableFields.length > 0){
            let queryFields = [];

            if(!(query.fields && query.fields.length)){
                queryFields = _.keys(this.toConfig().fields)
            }
            
            if(_.isArray(query.fields)){
                queryFields = query.fields
            }else if(_.isString(query.fields)){
                queryFields = query.fields.split(',')
            }

            query.fields = _.difference(queryFields, userObjectUnreadableFields).join(',')
        }
    }

    private async callAdapter(method: string, ...args: any[]) {
        
        const adapterMethod = this._datasource[method];
        if (typeof adapterMethod !== 'function') {
            throw new Error('Adapted does not support "' + method + '" method');
        }
        let allow = await this.allow(method, args[args.length - 1])
        if (!allow) {
            throw new Error('not find permission')
        }
        
        let beforeTriggerContext = await this.getTriggerContext('before', method, args)
        await this.runBeforeTriggers(method, beforeTriggerContext)

        let afterTriggerContext = await this.getTriggerContext('after', method, args)

        let returnValue = await adapterMethod.apply(this._datasource, args);

        await this.runAfterTriggers(method, afterTriggerContext)

        return returnValue
    };


    /***** get/set *****/
    public get schema(): SteedosSchema {
        return this._schema;
    }

    public get name(): string {
        return this._name;
    }

    public get fields(): Dictionary<SteedosFieldType> {
        return this._fields;
    }

    public get actions(): Dictionary<SteedosActionType> {
        return this._actions;
    }

    public get triggers(): Dictionary<SteedosTriggerType> {
        return this._triggers;
    }

    public get listeners(): Dictionary<SteedosListenerConfig> {
        return this._listeners;
    }
    public set listeners(value: Dictionary<SteedosListenerConfig>) {
        this._listeners = value;
    }

    public get list_views(): Dictionary<SteedosObjectListViewType> {
        return this._list_views;
    }

    public get tableName(): string {
        return this._tableName;
    }
}
