(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var ReactiveDict = Package['reactive-dict'].ReactiveDict;
var Random = Package.random.Random;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var check = Package.check.check;
var Match = Package.check.Match;
var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var JsonRoutes = Package['simple:json-routes'].JsonRoutes;
var RestMiddleware = Package['simple:json-routes'].RestMiddleware;
var Restivus = Package['nimble:restivus'].Restivus;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var Tabular = Package['aldeed:tabular'].Tabular;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var SubsManager = Package['meteorhacks:subs-manager'].SubsManager;
var _i18n = Package['universe:i18n']._i18n;
var i18n = Package['universe:i18n'].i18n;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Collection2 = Package['aldeed:collection2-core'].Collection2;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var __coffeescriptShare;

var require = meteorInstall({"node_modules":{"meteor":{"steedos:object-database":{"server":{"routes":{"api_creator_objects.coffee":function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/steedos_object-database/server/routes/api_creator_objects.coffee                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var _getLocale, clone, getUserProfileObjectLayout, objectql, steedosAuth, steedosI18n;

clone = require("clone");
steedosAuth = require("@steedos/auth");
steedosI18n = require("@steedos/i18n");
objectql = require("@steedos/objectql");

_getLocale = function (user) {
  var locale, ref, ref1;

  if ((user != null ? (ref = user.locale) != null ? ref.toLocaleLowerCase() : void 0 : void 0) === 'zh-cn') {
    locale = "zh-CN";
  } else if ((user != null ? (ref1 = user.locale) != null ? ref1.toLocaleLowerCase() : void 0 : void 0) === 'en-us') {
    locale = "en";
  } else {
    locale = "zh-CN";
  }

  return locale;
};

getUserProfileObjectLayout = function (userId, spaceId, objectName) {
  var ref, spaceUser;
  spaceUser = Creator.getCollection("space_users").findOne({
    space: spaceId,
    user: userId
  }, {
    fields: {
      profile: 1
    }
  });

  if (spaceUser && spaceUser.profile) {
    return (ref = Creator.getCollection("object_layouts")) != null ? ref.findOne({
      space: spaceId,
      profiles: spaceUser.profile,
      object_name: objectName
    }) : void 0;
  }
};

JsonRoutes.add('get', '/api/creator/:space/objects/:_id', function (req, res, next) {
  var _fields, _id, _object, authToken, e, isSpaceAdmin, lng, object, objectLayout, permissions, psets, psetsAdmin, psetsAdmin_pos, psetsCurrent, psetsCurrentNames, psetsCurrent_pos, psetsCustomer, psetsCustomer_pos, psetsGuest, psetsGuest_pos, psetsMember, psetsMember_pos, psetsSupplier, psetsSupplier_pos, psetsUser, psetsUser_pos, ref, ref1, set_ids, spaceId, spaceUser, type, userId, userSession;

  try {
    _id = req.params._id;
    spaceId = req.params.space;
    userId = req.headers["x-user-id"];
    type = (ref = req.query) != null ? ref.type : void 0;
    _object = Creator.getCollection('objects').findOne(_id) || {};
    object = {};

    if (!_.isEmpty(_object)) {
      isSpaceAdmin = false;
      spaceUser = null;

      if (userId) {
        isSpaceAdmin = Creator.isSpaceAdmin(spaceId, userId);
        spaceUser = Creator.getCollection("space_users").findOne({
          space: spaceId,
          user: userId
        }, {
          fields: {
            profile: 1
          }
        });
      }

      psetsAdmin = Creator.getCollection("permission_set").findOne({
        space: spaceId,
        name: 'admin'
      }, {
        fields: {
          _id: 1,
          assigned_apps: 1
        }
      }) || null;
      psetsUser = Creator.getCollection("permission_set").findOne({
        space: spaceId,
        name: 'user'
      }, {
        fields: {
          _id: 1,
          assigned_apps: 1
        }
      }) || null;
      psetsMember = Creator.getCollection("permission_set").findOne({
        space: spaceId,
        name: 'member'
      }, {
        fields: {
          _id: 1,
          assigned_apps: 1
        }
      }) || null;
      psetsGuest = Creator.getCollection("permission_set").findOne({
        space: spaceId,
        name: 'guest'
      }, {
        fields: {
          _id: 1,
          assigned_apps: 1
        }
      }) || null;
      psetsSupplier = Creator.getCollection("permission_set").findOne({
        space: spaceId,
        name: 'supplier'
      }, {
        fields: {
          _id: 1,
          assigned_apps: 1
        }
      }) || null;
      psetsCustomer = Creator.getCollection("permission_set").findOne({
        space: spaceId,
        name: 'customer'
      }, {
        fields: {
          _id: 1,
          assigned_apps: 1
        }
      }) || null;

      if (spaceUser && spaceUser.profile) {
        psetsCurrent = Creator.getCollection("permission_set").find({
          space: spaceId,
          $or: [{
            users: userId
          }, {
            name: spaceUser.profile
          }]
        }, {
          fields: {
            _id: 1,
            assigned_apps: 1,
            name: 1
          }
        }).fetch();
      } else {
        psetsCurrent = Creator.getCollection("permission_set").find({
          users: userId,
          space: spaceId
        }, {
          fields: {
            _id: 1,
            assigned_apps: 1,
            name: 1
          }
        }).fetch();
      }

      psetsAdmin_pos = null;
      psetsUser_pos = null;
      psetsMember_pos = null;
      psetsGuest_pos = null;
      psetsCurrent_pos = null;
      psetsSupplier_pos = null;
      psetsCustomer_pos = null;

      if (psetsAdmin != null ? psetsAdmin._id : void 0) {
        psetsAdmin_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: psetsAdmin._id
        }, {
          fields: {
            created: 0,
            modified: 0,
            created_by: 0,
            modified_by: 0
          }
        }).fetch();
      }

      if (psetsUser != null ? psetsUser._id : void 0) {
        psetsUser_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: psetsUser._id
        }, {
          fields: {
            created: 0,
            modified: 0,
            created_by: 0,
            modified_by: 0
          }
        }).fetch();
      }

      if (psetsMember != null ? psetsMember._id : void 0) {
        psetsMember_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: psetsMember._id
        }, {
          fields: {
            created: 0,
            modified: 0,
            created_by: 0,
            modified_by: 0
          }
        }).fetch();
      }

      if (psetsGuest != null ? psetsGuest._id : void 0) {
        psetsGuest_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: psetsGuest._id
        }, {
          fields: {
            created: 0,
            modified: 0,
            created_by: 0,
            modified_by: 0
          }
        }).fetch();
      }

      if (psetsSupplier != null ? psetsSupplier._id : void 0) {
        psetsSupplier_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: psetsSupplier._id
        }, {
          fields: {
            created: 0,
            modified: 0,
            created_by: 0,
            modified_by: 0
          }
        }).fetch();
      }

      if (psetsCustomer != null ? psetsCustomer._id : void 0) {
        psetsCustomer_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: psetsCustomer._id
        }, {
          fields: {
            created: 0,
            modified: 0,
            created_by: 0,
            modified_by: 0
          }
        }).fetch();
      }

      if (psetsCurrent.length > 0) {
        set_ids = _.pluck(psetsCurrent, "_id");
        psetsCurrent_pos = Creator.getCollection("permission_objects").find({
          permission_set_id: {
            $in: set_ids
          }
        }).fetch();
        psetsCurrentNames = _.pluck(psetsCurrent, "name");
      }

      psets = {
        psetsAdmin: psetsAdmin,
        psetsUser: psetsUser,
        psetsCurrent: psetsCurrent,
        psetsMember: psetsMember,
        psetsGuest: psetsGuest,
        psetsSupplier: psetsSupplier,
        psetsCustomer: psetsCustomer,
        isSpaceAdmin: isSpaceAdmin,
        spaceUser: spaceUser,
        psetsAdmin_pos: psetsAdmin_pos,
        psetsUser_pos: psetsUser_pos,
        psetsMember_pos: psetsMember_pos,
        psetsGuest_pos: psetsGuest_pos,
        psetsSupplier_pos: psetsSupplier_pos,
        psetsCustomer_pos: psetsCustomer_pos,
        psetsCurrent_pos: psetsCurrent_pos
      };

      if (isSpaceAdmin || _object.in_development === '0' && _object.is_enable) {
        if (_object.datasource !== 'default') {
          authToken = Steedos.getAuthToken(req, res);
          userSession = Meteor.wrapAsync(function (authToken, spaceId, cb) {
            return steedosAuth.getSession(authToken, spaceId).then(function (resolve, reject) {
              return cb(reject, resolve);
            });
          })(authToken, spaceId);
          permissions = Meteor.wrapAsync(function (v, userSession, cb) {
            return v.getUserObjectPermission(userSession).then(function (resolve, reject) {
              return cb(reject, resolve);
            });
          });
          object = Creator.convertObject(clone(objectql.getObject(_object.name).toConfig()), spaceId);
          object.database_name = (ref1 = Creator.getCollection("datasources").findOne({
            _id: _object.datasource
          })) != null ? ref1.label : void 0;
          object.permissions = permissions(objectql.getObject(_object.name), userSession);
        } else {
          object = Creator.convertObject(clone(Creator.Objects[_object.name]), spaceId);
          object.permissions = Creator.getObjectPermissions.bind(psets)(spaceId, userId, object.name);
        }

        delete object.db;
        object.list_views = Creator.getUserObjectListViews(userId, spaceId, object.name);
        lng = _getLocale(db.users.findOne(userId, {
          fields: {
            locale: 1
          }
        }));
        steedosI18n.translationObject(lng, object.name, Object.assign(object, {
          datasource: _object.datasource
        }));
        objectLayout = getUserProfileObjectLayout(userId, spaceId, object.name);

        if (objectLayout) {
          _fields = {};

          _.each(objectLayout.fields, function (_item) {
            _fields[_item.field] = object.fields[_item.field];

            if (_.has(_item, 'group')) {
              _fields[_item.field].group = _item.group;
            }

            if (_item.required) {
              _fields[_item.field].readonly = false;
              _fields[_item.field].disabled = false;
              return _fields[_item.field].required = true;
            } else if (_item.readonly) {
              _fields[_item.field].readonly = true;
              _fields[_item.field].disabled = true;
              return _fields[_item.field].required = false;
            }
          });

          object.fields = _fields;
          object.allow_actions = objectLayout.actions || [];
          object.allow_relatedList = objectLayout.relatedList || [];
        }
      }
    }

    return JsonRoutes.sendResult(res, {
      code: 200,
      data: object
    });
  } catch (error) {
    e = error;
    console.error(e.stack);
    return JsonRoutes.sendResult(res, {
      code: 200,
      data: {
        errors: [{
          errorMessage: e.reason || e.message
        }]
      }
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"publications":{"objects.coffee":function(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/steedos_object-database/server/publications/objects.coffee                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var objectql;
objectql = require("@steedos/objectql");
Meteor.publish("creator_objects", function (space) {
  var config;
  config = objectql.getSteedosConfig();

  if (config.tenant && config.tenant.saas) {
    return;
  }

  return Creator.getCollection("objects").find({
    space: {
      $in: [null, space]
    },
    is_deleted: {
      $ne: true
    }
  }, {
    fields: {
      _id: 1,
      modified: 1,
      is_enable: 1,
      in_development: 1
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"object_layouts.coffee":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/steedos_object-database/server/publications/object_layouts.coffee                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
Meteor.publish("publish_object_layouts", function (space) {
  var spaceUser, userId;
  userId = this.userId;

  if (!userId) {
    return;
  }

  spaceUser = Creator.getCollection("space_users").findOne({
    space: space,
    user: userId
  }, {
    fields: {
      profile: 1
    }
  });

  if (spaceUser && spaceUser.profile) {
    return Creator.getCollection("object_layouts").find({
      space: {
        $in: [null, space]
      },
      profiles: spaceUser.profile
    }, {
      fields: {
        _id: 1,
        modified: 1,
        object_name: 1
      }
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".coffee"
  ]
});

require("/node_modules/meteor/steedos:object-database/server/routes/api_creator_objects.coffee");
require("/node_modules/meteor/steedos:object-database/server/publications/objects.coffee");
require("/node_modules/meteor/steedos:object-database/server/publications/object_layouts.coffee");

/* Exports */
Package._define("steedos:object-database");

})();

//# sourceURL=meteor://💻app/packages/steedos_object-database.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3RlZWRvc19vYmplY3QtZGF0YWJhc2Uvc2VydmVyL3JvdXRlcy9hcGlfY3JlYXRvcl9vYmplY3RzLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL3JvdXRlcy9hcGlfY3JlYXRvcl9vYmplY3RzLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3RlZWRvc19vYmplY3QtZGF0YWJhc2Uvc2VydmVyL3B1YmxpY2F0aW9ucy9vYmplY3RzLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL3B1YmxpY2F0aW9ucy9vYmplY3RzLmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3RlZWRvc19vYmplY3QtZGF0YWJhc2Uvc2VydmVyL3B1YmxpY2F0aW9ucy9vYmplY3RfbGF5b3V0cy5jb2ZmZWUiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9wdWJsaWNhdGlvbnMvb2JqZWN0X2xheW91dHMuY29mZmVlIl0sIm5hbWVzIjpbIl9nZXRMb2NhbGUiLCJjbG9uZSIsImdldFVzZXJQcm9maWxlT2JqZWN0TGF5b3V0Iiwib2JqZWN0cWwiLCJzdGVlZG9zQXV0aCIsInN0ZWVkb3NJMThuIiwicmVxdWlyZSIsInVzZXIiLCJsb2NhbGUiLCJyZWYiLCJyZWYxIiwidG9Mb2NhbGVMb3dlckNhc2UiLCJ1c2VySWQiLCJzcGFjZUlkIiwib2JqZWN0TmFtZSIsInNwYWNlVXNlciIsIkNyZWF0b3IiLCJnZXRDb2xsZWN0aW9uIiwiZmluZE9uZSIsInNwYWNlIiwiZmllbGRzIiwicHJvZmlsZSIsInByb2ZpbGVzIiwib2JqZWN0X25hbWUiLCJKc29uUm91dGVzIiwiYWRkIiwicmVxIiwicmVzIiwibmV4dCIsIl9maWVsZHMiLCJfaWQiLCJfb2JqZWN0IiwiYXV0aFRva2VuIiwiZSIsImlzU3BhY2VBZG1pbiIsImxuZyIsIm9iamVjdCIsIm9iamVjdExheW91dCIsInBlcm1pc3Npb25zIiwicHNldHMiLCJwc2V0c0FkbWluIiwicHNldHNBZG1pbl9wb3MiLCJwc2V0c0N1cnJlbnQiLCJwc2V0c0N1cnJlbnROYW1lcyIsInBzZXRzQ3VycmVudF9wb3MiLCJwc2V0c0N1c3RvbWVyIiwicHNldHNDdXN0b21lcl9wb3MiLCJwc2V0c0d1ZXN0IiwicHNldHNHdWVzdF9wb3MiLCJwc2V0c01lbWJlciIsInBzZXRzTWVtYmVyX3BvcyIsInBzZXRzU3VwcGxpZXIiLCJwc2V0c1N1cHBsaWVyX3BvcyIsInBzZXRzVXNlciIsInBzZXRzVXNlcl9wb3MiLCJzZXRfaWRzIiwidHlwZSIsInVzZXJTZXNzaW9uIiwicGFyYW1zIiwiaGVhZGVycyIsInF1ZXJ5IiwiXyIsImlzRW1wdHkiLCJuYW1lIiwiYXNzaWduZWRfYXBwcyIsImZpbmQiLCIkb3IiLCJ1c2VycyIsImZldGNoIiwicGVybWlzc2lvbl9zZXRfaWQiLCJjcmVhdGVkIiwibW9kaWZpZWQiLCJjcmVhdGVkX2J5IiwibW9kaWZpZWRfYnkiLCJsZW5ndGgiLCJwbHVjayIsIiRpbiIsImluX2RldmVsb3BtZW50IiwiaXNfZW5hYmxlIiwiZGF0YXNvdXJjZSIsIlN0ZWVkb3MiLCJnZXRBdXRoVG9rZW4iLCJNZXRlb3IiLCJ3cmFwQXN5bmMiLCJjYiIsImdldFNlc3Npb24iLCJ0aGVuIiwicmVzb2x2ZSIsInJlamVjdCIsInYiLCJnZXRVc2VyT2JqZWN0UGVybWlzc2lvbiIsImNvbnZlcnRPYmplY3QiLCJnZXRPYmplY3QiLCJ0b0NvbmZpZyIsImRhdGFiYXNlX25hbWUiLCJsYWJlbCIsIk9iamVjdHMiLCJnZXRPYmplY3RQZXJtaXNzaW9ucyIsImJpbmQiLCJkYiIsImxpc3Rfdmlld3MiLCJnZXRVc2VyT2JqZWN0TGlzdFZpZXdzIiwidHJhbnNsYXRpb25PYmplY3QiLCJPYmplY3QiLCJhc3NpZ24iLCJlYWNoIiwiX2l0ZW0iLCJmaWVsZCIsImhhcyIsImdyb3VwIiwicmVxdWlyZWQiLCJyZWFkb25seSIsImRpc2FibGVkIiwiYWxsb3dfYWN0aW9ucyIsImFjdGlvbnMiLCJhbGxvd19yZWxhdGVkTGlzdCIsInJlbGF0ZWRMaXN0Iiwic2VuZFJlc3VsdCIsImNvZGUiLCJkYXRhIiwiZXJyb3IiLCJjb25zb2xlIiwic3RhY2siLCJlcnJvcnMiLCJlcnJvck1lc3NhZ2UiLCJyZWFzb24iLCJtZXNzYWdlIiwicHVibGlzaCIsImNvbmZpZyIsImdldFN0ZWVkb3NDb25maWciLCJ0ZW5hbnQiLCJzYWFzIiwiaXNfZGVsZXRlZCIsIiRuZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFBQSxVQUFBLEVBQUFDLEtBQUEsRUFBQUMsMEJBQUEsRUFBQUMsUUFBQSxFQUFBQyxXQUFBLEVBQUFDLFdBQUE7O0FBQUFKLFFBQVFLLFFBQVEsT0FBUixDQUFSO0FBQ0FGLGNBQWNFLFFBQVEsZUFBUixDQUFkO0FBQ0FELGNBQWNDLFFBQVEsZUFBUixDQUFkO0FBQ0FILFdBQVdHLFFBQVEsbUJBQVIsQ0FBWDs7QUFFQU4sYUFBYSxVQUFDTyxJQUFEO0FBQ1osTUFBQUMsTUFBQSxFQUFBQyxHQUFBLEVBQUFDLElBQUE7O0FBQUEsT0FBQUgsUUFBQSxRQUFBRSxNQUFBRixLQUFBQyxNQUFBLFlBQUFDLElBQWlCRSxpQkFBakIsS0FBRyxNQUFILEdBQUcsTUFBSCxNQUF3QyxPQUF4QztBQUNDSCxhQUFTLE9BQVQ7QUFERCxTQUVLLEtBQUFELFFBQUEsUUFBQUcsT0FBQUgsS0FBQUMsTUFBQSxZQUFBRSxLQUFpQkMsaUJBQWpCLEtBQUcsTUFBSCxHQUFHLE1BQUgsTUFBd0MsT0FBeEM7QUFDSkgsYUFBUyxJQUFUO0FBREk7QUFHSkEsYUFBUyxPQUFUO0FDT0M7O0FETkYsU0FBT0EsTUFBUDtBQVBZLENBQWI7O0FBU0FOLDZCQUE2QixVQUFDVSxNQUFELEVBQVNDLE9BQVQsRUFBa0JDLFVBQWxCO0FBQzVCLE1BQUFMLEdBQUEsRUFBQU0sU0FBQTtBQUFBQSxjQUFZQyxRQUFRQyxhQUFSLENBQXNCLGFB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Q0FBbkI7QUFBc0JoRCxxQkFBYTtBQUFuQztBQUFULEtBQXpHLENDU0U7QUFZRDtBRDNCSCxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9zdGVlZG9zX29iamVjdC1kYXRhYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsb25lID0gcmVxdWlyZShcImNsb25lXCIpO1xyXG5zdGVlZG9zQXV0aCA9IHJlcXVpcmUoXCJAc3RlZWRvcy9hdXRoXCIpO1xyXG5zdGVlZG9zSTE4biA9IHJlcXVpcmUoXCJAc3RlZWRvcy9pMThuXCIpO1xyXG5vYmplY3RxbCA9IHJlcXVpcmUoXCJAc3RlZWRvcy9vYmplY3RxbFwiKTtcclxuXHJcbl9nZXRMb2NhbGUgPSAodXNlciktPlxyXG5cdGlmIHVzZXI/LmxvY2FsZT8udG9Mb2NhbGVMb3dlckNhc2UoKSA9PSAnemgtY24nXHJcblx0XHRsb2NhbGUgPSBcInpoLUNOXCJcclxuXHRlbHNlIGlmIHVzZXI/LmxvY2FsZT8udG9Mb2NhbGVMb3dlckNhc2UoKSA9PSAnZW4tdXMnXHJcblx0XHRsb2NhbGUgPSBcImVuXCJcclxuXHRlbHNlXHJcblx0XHRsb2NhbGUgPSBcInpoLUNOXCJcclxuXHRyZXR1cm4gbG9jYWxlXHJcblxyXG5nZXRVc2VyUHJvZmlsZU9iamVjdExheW91dCA9ICh1c2VySWQsIHNwYWNlSWQsIG9iamVjdE5hbWUpLT5cclxuXHRzcGFjZVVzZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJzcGFjZV91c2Vyc1wiKS5maW5kT25lKHtzcGFjZTogc3BhY2VJZCwgdXNlcjogdXNlcklkfSwge2ZpZWxkczoge3Byb2ZpbGU6IDF9fSlcclxuXHRpZiBzcGFjZVVzZXIgJiYgc3BhY2VVc2VyLnByb2ZpbGVcclxuXHRcdHJldHVybiBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJvYmplY3RfbGF5b3V0c1wiKT8uZmluZE9uZSh7c3BhY2U6IHNwYWNlSWQsIHByb2ZpbGVzOiBzcGFjZVVzZXIucHJvZmlsZSwgb2JqZWN0X25hbWU6IG9iamVjdE5hbWV9KTtcclxuXHJcbkpzb25Sb3V0ZXMuYWRkICdnZXQnLCAnL2FwaS9jcmVhdG9yLzpzcGFjZS9vYmplY3RzLzpfaWQnLCAocmVxLCByZXMsIG5leHQpIC0+XHJcblx0dHJ5XHJcblx0XHRfaWQgPSByZXEucGFyYW1zLl9pZFxyXG5cdFx0c3BhY2VJZCA9IHJlcS5wYXJhbXMuc3BhY2VcclxuXHRcdHVzZXJJZCA9IHJlcS5oZWFkZXJzW1wieC11c2VyLWlkXCJdXHJcblxyXG5cdFx0dHlwZSA9IHJlcS5xdWVyeT8udHlwZVxyXG5cclxuXHRcdF9vYmplY3QgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oJ29iamVjdHMnKS5maW5kT25lKF9pZCkgfHwge31cclxuXHJcblx0XHRvYmplY3QgPSB7fVxyXG5cdFx0aWYgIV8uaXNFbXB0eShfb2JqZWN0KVxyXG5cdFx0XHRpc1NwYWNlQWRtaW4gPSBmYWxzZVxyXG5cdFx0XHRzcGFjZVVzZXIgPSBudWxsXHJcblx0XHRcdGlmIHVzZXJJZFxyXG5cdFx0XHRcdGlzU3BhY2VBZG1pbiA9IENyZWF0b3IuaXNTcGFjZUFkbWluKHNwYWNlSWQsIHVzZXJJZClcclxuXHRcdFx0XHRzcGFjZVVzZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJzcGFjZV91c2Vyc1wiKS5maW5kT25lKHsgc3BhY2U6IHNwYWNlSWQsIHVzZXI6IHVzZXJJZCB9LCB7IGZpZWxkczogeyBwcm9maWxlOiAxIH0gfSlcclxuXHJcblx0XHRcdHBzZXRzQWRtaW4gPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtzcGFjZTogc3BhY2VJZCwgbmFtZTogJ2FkbWluJ30sIHtmaWVsZHM6e19pZDoxLCBhc3NpZ25lZF9hcHBzOjF9fSkgfHwgbnVsbFxyXG5cdFx0XHRwc2V0c1VzZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtzcGFjZTogc3BhY2VJZCwgbmFtZTogJ3VzZXInfSwge2ZpZWxkczp7X2lkOjEsIGFzc2lnbmVkX2FwcHM6MX19KSB8fCBudWxsXHJcblx0XHRcdHBzZXRzTWVtYmVyID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9zZXRcIikuZmluZE9uZSh7c3BhY2U6IHNwYWNlSWQsIG5hbWU6ICdtZW1iZXInfSwge2ZpZWxkczp7X2lkOjEsIGFzc2lnbmVkX2FwcHM6MX19KSB8fCBudWxsXHJcblx0XHRcdHBzZXRzR3Vlc3QgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtzcGFjZTogc3BhY2VJZCwgbmFtZTogJ2d1ZXN0J30sIHtmaWVsZHM6e19pZDoxLCBhc3NpZ25lZF9hcHBzOjF9fSkgfHwgbnVsbFxyXG5cclxuXHRcdFx0cHNldHNTdXBwbGllciA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fc2V0XCIpLmZpbmRPbmUoe3NwYWNlOiBzcGFjZUlkLCBuYW1lOiAnc3VwcGxpZXInfSwge2ZpZWxkczp7X2lkOjEsIGFzc2lnbmVkX2FwcHM6MX19KSB8fCBudWxsXHJcblx0XHRcdHBzZXRzQ3VzdG9tZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtzcGFjZTogc3BhY2VJZCwgbmFtZTogJ2N1c3RvbWVyJ30sIHtmaWVsZHM6e19pZDoxLCBhc3NpZ25lZF9hcHBzOjF9fSkgfHwgbnVsbFxyXG5cdFx0XHRpZiBzcGFjZVVzZXIgJiYgc3BhY2VVc2VyLnByb2ZpbGVcclxuXHRcdFx0XHRwc2V0c0N1cnJlbnQgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kKHtzcGFjZTogc3BhY2VJZCwgJG9yOiBbe3VzZXJzOiB1c2VySWR9LCB7bmFtZTogc3BhY2VVc2VyLnByb2ZpbGV9XX0sIHtmaWVsZHM6e19pZDoxLCBhc3NpZ25lZF9hcHBzOjEsIG5hbWU6MX19KS5mZXRjaCgpXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRwc2V0c0N1cnJlbnQgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kKHt1c2VyczogdXNlcklkLCBzcGFjZTogc3BhY2VJZH0sIHtmaWVsZHM6e19pZDoxLCBhc3NpZ25lZF9hcHBzOjEsIG5hbWU6MX19KS5mZXRjaCgpXHJcblxyXG5cdFx0XHRwc2V0c0FkbWluX3BvcyA9IG51bGxcclxuXHRcdFx0cHNldHNVc2VyX3BvcyA9IG51bGxcclxuXHRcdFx0cHNldHNNZW1iZXJfcG9zID0gbnVsbFxyXG5cdFx0XHRwc2V0c0d1ZXN0X3BvcyA9IG51bGxcclxuXHRcdFx0cHNldHNDdXJyZW50X3BvcyA9IG51bGxcclxuXHRcdFx0cHNldHNTdXBwbGllcl9wb3MgPSBudWxsXHJcblx0XHRcdHBzZXRzQ3VzdG9tZXJfcG9zID0gbnVsbFxyXG5cclxuXHRcdFx0aWYgcHNldHNBZG1pbj8uX2lkXHJcblx0XHRcdFx0cHNldHNBZG1pbl9wb3MgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX29iamVjdHNcIikuZmluZCh7cGVybWlzc2lvbl9zZXRfaWQ6IHBzZXRzQWRtaW4uX2lkfSwge2ZpZWxkczoge2NyZWF0ZWQ6IDAsIG1vZGlmaWVkOiAwLCBjcmVhdGVkX2J5OiAwLCBtb2RpZmllZF9ieTogMH19KS5mZXRjaCgpXHJcblx0XHRcdGlmIHBzZXRzVXNlcj8uX2lkXHJcblx0XHRcdFx0cHNldHNVc2VyX3BvcyA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fb2JqZWN0c1wiKS5maW5kKHtwZXJtaXNzaW9uX3NldF9pZDogcHNldHNVc2VyLl9pZH0sIHtmaWVsZHM6IHtjcmVhdGVkOiAwLCBtb2RpZmllZDogMCwgY3JlYXRlZF9ieTogMCwgbW9kaWZpZWRfYnk6IDB9fSkuZmV0Y2goKVxyXG5cdFx0XHRpZiBwc2V0c01lbWJlcj8uX2lkXHJcblx0XHRcdFx0cHNldHNNZW1iZXJfcG9zID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9vYmplY3RzXCIpLmZpbmQoe3Blcm1pc3Npb25fc2V0X2lkOiBwc2V0c01lbWJlci5faWR9LCB7ZmllbGRzOiB7Y3JlYXRlZDogMCwgbW9kaWZpZWQ6IDAsIGNyZWF0ZWRfYnk6IDAsIG1vZGlmaWVkX2J5OiAwfX0pLmZldGNoKClcclxuXHRcdFx0aWYgcHNldHNHdWVzdD8uX2lkXHJcblx0XHRcdFx0cHNldHNHdWVzdF9wb3MgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX29iamVjdHNcIikuZmluZCh7cGVybWlzc2lvbl9zZXRfaWQ6IHBzZXRzR3Vlc3QuX2lkfSwge2ZpZWxkczoge2NyZWF0ZWQ6IDAsIG1vZGlmaWVkOiAwLCBjcmVhdGVkX2J5OiAwLCBtb2RpZmllZF9ieTogMH19KS5mZXRjaCgpXHJcblx0XHRcdGlmIHBzZXRzU3VwcGxpZXI/Ll9pZFxyXG5cdFx0XHRcdHBzZXRzU3VwcGxpZXJfcG9zID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9vYmplY3RzXCIpLmZpbmQoe3Blcm1pc3Npb25fc2V0X2lkOiBwc2V0c1N1cHBsaWVyLl9pZH0sIHtmaWVsZHM6IHtjcmVhdGVkOiAwLCBtb2RpZmllZDogMCwgY3JlYXRlZF9ieTogMCwgbW9kaWZpZWRfYnk6IDB9fSkuZmV0Y2goKVxyXG5cdFx0XHRpZiBwc2V0c0N1c3RvbWVyPy5faWRcclxuXHRcdFx0XHRwc2V0c0N1c3RvbWVyX3BvcyA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fb2JqZWN0c1wiKS5maW5kKHtwZXJtaXNzaW9uX3NldF9pZDogcHNldHNDdXN0b21lci5faWR9LCB7ZmllbGRzOiB7Y3JlYXRlZDogMCwgbW9kaWZpZWQ6IDAsIGNyZWF0ZWRfYnk6IDAsIG1vZGlmaWVkX2J5OiAwfX0pLmZldGNoKClcclxuXHJcblx0XHRcdGlmIHBzZXRzQ3VycmVudC5sZW5ndGggPiAwXHJcblx0XHRcdFx0c2V0X2lkcyA9IF8ucGx1Y2sgcHNldHNDdXJyZW50LCBcIl9pZFwiXHJcblx0XHRcdFx0cHNldHNDdXJyZW50X3BvcyA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fb2JqZWN0c1wiKS5maW5kKHtwZXJtaXNzaW9uX3NldF9pZDogeyRpbjogc2V0X2lkc319KS5mZXRjaCgpXHJcblx0XHRcdFx0cHNldHNDdXJyZW50TmFtZXMgPSBfLnBsdWNrIHBzZXRzQ3VycmVudCwgXCJuYW1lXCJcclxuXHJcblx0XHRcdHBzZXRzID0ge1xyXG5cdFx0XHRcdHBzZXRzQWRtaW4sXHJcblx0XHRcdFx0cHNldHNVc2VyLFxyXG5cdFx0XHRcdHBzZXRzQ3VycmVudCxcclxuXHRcdFx0XHRwc2V0c01lbWJlcixcclxuXHRcdFx0XHRwc2V0c0d1ZXN0LFxyXG5cdFx0XHRcdHBzZXRzU3VwcGxpZXIsXHJcblx0XHRcdFx0cHNldHNDdXN0b21lcixcclxuXHRcdFx0XHRpc1NwYWNlQWRtaW4sXHJcblx0XHRcdFx0c3BhY2VVc2VyLFxyXG5cdFx0XHRcdHBzZXRzQWRtaW5fcG9zLFxyXG5cdFx0XHRcdHBzZXRzVXNlcl9wb3MsXHJcblx0XHRcdFx0cHNldHNNZW1iZXJfcG9zLFxyXG5cdFx0XHRcdHBzZXRzR3Vlc3RfcG9zLFxyXG5cdFx0XHRcdHBzZXRzU3VwcGxpZXJfcG9zLFxyXG5cdFx0XHRcdHBzZXRzQ3VzdG9tZXJfcG9zLFxyXG5cdFx0XHRcdHBzZXRzQ3VycmVudF9wb3NcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgaXNTcGFjZUFkbWluIHx8IF9vYmplY3QuaW5fZGV2ZWxvcG1lbnQgPT0gJzAnICYmIF9vYmplY3QuaXNfZW5hYmxlXHJcblx0XHRcdFx0aWYgX29iamVjdC5kYXRhc291cmNlICE9ICdkZWZhdWx0J1xyXG5cdFx0XHRcdFx0YXV0aFRva2VuID0gU3RlZWRvcy5nZXRBdXRoVG9rZW4ocmVxLCByZXMpXHJcblx0XHRcdFx0XHR1c2VyU2Vzc2lvbiA9IE1ldGVvci53cmFwQXN5bmMoKGF1dGhUb2tlbiwgc3BhY2VJZCwgY2IpLT5cclxuXHRcdFx0XHRcdFx0c3RlZWRvc0F1dGguZ2V0U2Vzc2lvbihhdXRoVG9rZW4sIHNwYWNlSWQpLnRoZW4gKHJlc29sdmUsIHJlamVjdCktPlxyXG5cdFx0XHRcdFx0XHRcdGNiKHJlamVjdCwgcmVzb2x2ZSlcclxuXHRcdFx0XHRcdCkoYXV0aFRva2VuLCBzcGFjZUlkKVxyXG5cdFx0XHRcdFx0cGVybWlzc2lvbnMgPSBNZXRlb3Iud3JhcEFzeW5jICh2LCB1c2VyU2Vzc2lvbiwgY2IpLT5cclxuXHRcdFx0XHRcdFx0di5nZXRVc2VyT2JqZWN0UGVybWlzc2lvbih1c2VyU2Vzc2lvbikudGhlbiAocmVzb2x2ZSwgcmVqZWN0KS0+XHJcblx0XHRcdFx0XHRcdFx0Y2IocmVqZWN0LCByZXNvbHZlKVxyXG5cdFx0XHRcdFx0b2JqZWN0ID0gQ3JlYXRvci5jb252ZXJ0T2JqZWN0KGNsb25lKG9iamVjdHFsLmdldE9iamVjdChfb2JqZWN0Lm5hbWUpLnRvQ29uZmlnKCkpLCBzcGFjZUlkKVxyXG5cdFx0XHRcdFx0b2JqZWN0LmRhdGFiYXNlX25hbWUgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJkYXRhc291cmNlc1wiKS5maW5kT25lKHtfaWQ6IF9vYmplY3QuZGF0YXNvdXJjZX0pPy5sYWJlbFxyXG5cdFx0XHRcdFx0b2JqZWN0LnBlcm1pc3Npb25zID0gcGVybWlzc2lvbnMob2JqZWN0cWwuZ2V0T2JqZWN0KF9vYmplY3QubmFtZSksIHVzZXJTZXNzaW9uKVxyXG5cdFx0XHRcdGVsc2VcclxuXHJcblx0XHRcdFx0XHRvYmplY3QgPSBDcmVhdG9yLmNvbnZlcnRPYmplY3QoY2xvbmUoQ3JlYXRvci5PYmplY3RzW19vYmplY3QubmFtZV0pLCBzcGFjZUlkKSAjIENyZWF0b3IuY29udmVydE9iamVjdChjbG9uZShDcmVhdG9yLk9iamVjdHNbX29iamVjdC5uYW1lXSksIHNwYWNlSWQpICMgQ3JlYXRvci5jb252ZXJ0T2JqZWN0KGNsb25lKG5ldyBDcmVhdG9yLk9iamVjdChfb2JqZWN0KSksIHNwYWNlSWQpO1xyXG5cdFx0XHRcdFx0b2JqZWN0LnBlcm1pc3Npb25zID0gQ3JlYXRvci5nZXRPYmplY3RQZXJtaXNzaW9ucy5iaW5kKHBzZXRzKShzcGFjZUlkLCB1c2VySWQsIG9iamVjdC5uYW1lKVxyXG5cclxuXHRcdFx0XHRkZWxldGUgb2JqZWN0LmRiXHJcblx0XHRcdFx0b2JqZWN0Lmxpc3Rfdmlld3MgPSBDcmVhdG9yLmdldFVzZXJPYmplY3RMaXN0Vmlld3ModXNlcklkLCBzcGFjZUlkLCBvYmplY3QubmFtZSlcclxuXHRcdFx0XHRsbmcgPSBfZ2V0TG9jYWxlKGRiLnVzZXJzLmZpbmRPbmUodXNlcklkLCB7ZmllbGRzOiB7bG9jYWxlOiAxfX0pKVxyXG5cdFx0XHRcdHN0ZWVkb3NJMThuLnRyYW5zbGF0aW9uT2JqZWN0KGxuZywgb2JqZWN0Lm5hbWUsIE9iamVjdC5hc3NpZ24ob2JqZWN0LCB7ZGF0YXNvdXJjZTogX29iamVjdC5kYXRhc291cmNlfSkpXHJcblx0XHRcdFx0b2JqZWN0TGF5b3V0ID0gZ2V0VXNlclByb2ZpbGVPYmplY3RMYXlvdXQodXNlcklkLCBzcGFjZUlkLCBvYmplY3QubmFtZSlcclxuXHRcdFx0XHRpZiBvYmplY3RMYXlvdXRcclxuXHRcdFx0XHRcdF9maWVsZHMgPSB7fTtcclxuXHRcdFx0XHRcdF8uZWFjaCBvYmplY3RMYXlvdXQuZmllbGRzLCAoX2l0ZW0pLT5cclxuXHRcdFx0XHRcdFx0X2ZpZWxkc1tfaXRlbS5maWVsZF0gPSBvYmplY3QuZmllbGRzW19pdGVtLmZpZWxkXVxyXG5cdFx0XHRcdFx0XHRpZiBfLmhhcyhfaXRlbSwgJ2dyb3VwJylcclxuXHRcdFx0XHRcdFx0XHRfZmllbGRzW19pdGVtLmZpZWxkXS5ncm91cCA9IF9pdGVtLmdyb3VwXHJcblx0XHRcdFx0XHRcdGlmIF9pdGVtLnJlcXVpcmVkXHJcblx0XHRcdFx0XHRcdFx0X2ZpZWxkc1tfaXRlbS5maWVsZF0ucmVhZG9ubHkgPSBmYWxzZVxyXG5cdFx0XHRcdFx0XHRcdF9maWVsZHNbX2l0ZW0uZmllbGRdLmRpc2FibGVkID0gZmFsc2VcclxuXHRcdFx0XHRcdFx0XHRfZmllbGRzW19pdGVtLmZpZWxkXS5yZXF1aXJlZCA9IHRydWVcclxuXHRcdFx0XHRcdFx0ZWxzZSBpZiBfaXRlbS5yZWFkb25seVxyXG5cdFx0XHRcdFx0XHRcdF9maWVsZHNbX2l0ZW0uZmllbGRdLnJlYWRvbmx5ID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRcdF9maWVsZHNbX2l0ZW0uZmllbGRdLmRpc2FibGVkID0gdHJ1ZVxyXG5cdFx0XHRcdFx0XHRcdF9maWVsZHNbX2l0ZW0uZmllbGRdLnJlcXVpcmVkID0gZmFsc2VcclxuXHRcdFx0XHRcdG9iamVjdC5maWVsZHMgPSBfZmllbGRzXHJcblx0XHRcdFx0XHRvYmplY3QuYWxsb3dfYWN0aW9ucyA9IG9iamVjdExheW91dC5hY3Rpb25zIHx8IFtdXHJcblx0XHRcdFx0XHRvYmplY3QuYWxsb3dfcmVsYXRlZExpc3QgPSBvYmplY3RMYXlvdXQucmVsYXRlZExpc3QgfHwgW11cclxuXHRcdEpzb25Sb3V0ZXMuc2VuZFJlc3VsdCByZXMsIHtcclxuXHRcdFx0Y29kZTogMjAwXHJcblx0XHRcdGRhdGE6IG9iamVjdFxyXG5cdFx0fVxyXG5cdGNhdGNoIGVcclxuXHRcdGNvbnNvbGUuZXJyb3IgZS5zdGFja1xyXG5cdFx0SnNvblJvdXRlcy5zZW5kUmVzdWx0IHJlcywge1xyXG5cdFx0XHRjb2RlOiAyMDBcclxuXHRcdFx0ZGF0YTogeyBlcnJvcnM6IFt7IGVycm9yTWVzc2FnZTogZS5yZWFzb24gfHwgZS5tZXNzYWdlIH1dIH1cclxuXHRcdH0iLCJ2YXIgX2dldExvY2FsZSwgY2xvbmUsIGdldFVzZXJQcm9maWxlT2JqZWN0TGF5b3V0LCBvYmplY3RxbCwgc3RlZWRvc0F1dGgsIHN0ZWVkb3NJMThuO1xuXG5jbG9uZSA9IHJlcXVpcmUoXCJjbG9uZVwiKTtcblxuc3RlZWRvc0F1dGggPSByZXF1aXJlKFwiQHN0ZWVkb3MvYXV0aFwiKTtcblxuc3RlZWRvc0kxOG4gPSByZXF1aXJlKFwiQHN0ZWVkb3MvaTE4blwiKTtcblxub2JqZWN0cWwgPSByZXF1aXJlKFwiQHN0ZWVkb3Mvb2JqZWN0cWxcIik7XG5cbl9nZXRMb2NhbGUgPSBmdW5jdGlvbih1c2VyKSB7XG4gIHZhciBsb2NhbGUsIHJlZiwgcmVmMTtcbiAgaWYgKCh1c2VyICE9IG51bGwgPyAocmVmID0gdXNlci5sb2NhbGUpICE9IG51bGwgPyByZWYudG9Mb2NhbGVMb3dlckNhc2UoKSA6IHZvaWQgMCA6IHZvaWQgMCkgPT09ICd6aC1jbicpIHtcbiAgICBsb2NhbGUgPSBcInpoLUNOXCI7XG4gIH0gZWxzZSBpZiAoKHVzZXIgIT0gbnVsbCA/IChyZWYxID0gdXNlci5sb2NhbGUpICE9IG51bGwgPyByZWYxLnRvTG9jYWxlTG93ZXJDYXNlKCkgOiB2b2lkIDAgOiB2b2lkIDApID09PSAnZW4tdXMnKSB7XG4gICAgbG9jYWxlID0gXCJlblwiO1xuICB9IGVsc2Uge1xuICAgIGxvY2FsZSA9IFwiemgtQ05cIjtcbiAgfVxuICByZXR1cm4gbG9jYWxlO1xufTtcblxuZ2V0VXNlclByb2ZpbGVPYmplY3RMYXlvdXQgPSBmdW5jdGlvbih1c2VySWQsIHNwYWNlSWQsIG9iamVjdE5hbWUpIHtcbiAgdmFyIHJlZiwgc3BhY2VVc2VyO1xuICBzcGFjZVVzZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJzcGFjZV91c2Vyc1wiKS5maW5kT25lKHtcbiAgICBzcGFjZTogc3BhY2VJZCxcbiAgICB1c2VyOiB1c2VySWRcbiAgfSwge1xuICAgIGZpZWxkczoge1xuICAgICAgcHJvZmlsZTogMVxuICAgIH1cbiAgfSk7XG4gIGlmIChzcGFjZVVzZXIgJiYgc3BhY2VVc2VyLnByb2ZpbGUpIHtcbiAgICByZXR1cm4gKHJlZiA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcIm9iamVjdF9sYXlvdXRzXCIpKSAhPSBudWxsID8gcmVmLmZpbmRPbmUoe1xuICAgICAgc3BhY2U6IHNwYWNlSWQsXG4gICAgICBwcm9maWxlczogc3BhY2VVc2VyLnByb2ZpbGUsXG4gICAgICBvYmplY3RfbmFtZTogb2JqZWN0TmFtZVxuICAgIH0pIDogdm9pZCAwO1xuICB9XG59O1xuXG5Kc29uUm91dGVzLmFkZCgnZ2V0JywgJy9hcGkvY3JlYXRvci86c3BhY2Uvb2JqZWN0cy86X2lkJywgZnVuY3Rpb24ocmVxLCByZXMsIG5leHQpIHtcbiAgdmFyIF9maWVsZHMsIF9pZCwgX29iamVjdCwgYXV0aFRva2VuLCBlLCBpc1NwYWNlQWRtaW4sIGxuZywgb2JqZWN0LCBvYmplY3RMYXlvdXQsIHBlcm1pc3Npb25zLCBwc2V0cywgcHNldHNBZG1pbiwgcHNldHNBZG1pbl9wb3MsIHBzZXRzQ3VycmVudCwgcHNldHNDdXJyZW50TmFtZXMsIHBzZXRzQ3VycmVudF9wb3MsIHBzZXRzQ3VzdG9tZXIsIHBzZXRzQ3VzdG9tZXJfcG9zLCBwc2V0c0d1ZXN0LCBwc2V0c0d1ZXN0X3BvcywgcHNldHNNZW1iZXIsIHBzZXRzTWVtYmVyX3BvcywgcHNldHNTdXBwbGllciwgcHNldHNTdXBwbGllcl9wb3MsIHBzZXRzVXNlciwgcHNldHNVc2VyX3BvcywgcmVmLCByZWYxLCBzZXRfaWRzLCBzcGFjZUlkLCBzcGFjZVVzZXIsIHR5cGUsIHVzZXJJZCwgdXNlclNlc3Npb247XG4gIHRyeSB7XG4gICAgX2lkID0gcmVxLnBhcmFtcy5faWQ7XG4gICAgc3BhY2VJZCA9IHJlcS5wYXJhbXMuc3BhY2U7XG4gICAgdXNlcklkID0gcmVxLmhlYWRlcnNbXCJ4LXVzZXItaWRcIl07XG4gICAgdHlwZSA9IChyZWYgPSByZXEucXVlcnkpICE9IG51bGwgPyByZWYudHlwZSA6IHZvaWQgMDtcbiAgICBfb2JqZWN0ID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKCdvYmplY3RzJykuZmluZE9uZShfaWQpIHx8IHt9O1xuICAgIG9iamVjdCA9IHt9O1xuICAgIGlmICghXy5pc0VtcHR5KF9vYmplY3QpKSB7XG4gICAgICBpc1NwYWNlQWRtaW4gPSBmYWxzZTtcbiAgICAgIHNwYWNlVXNlciA9IG51bGw7XG4gICAgICBpZiAodXNlcklkKSB7XG4gICAgICAgIGlzU3BhY2VBZG1pbiA9IENyZWF0b3IuaXNTcGFjZUFkbWluKHNwYWNlSWQsIHVzZXJJZCk7XG4gICAgICAgIHNwYWNlVXNlciA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInNwYWNlX3VzZXJzXCIpLmZpbmRPbmUoe1xuICAgICAgICAgIHNwYWNlOiBzcGFjZUlkLFxuICAgICAgICAgIHVzZXI6IHVzZXJJZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICBwcm9maWxlOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHBzZXRzQWRtaW4gPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtcbiAgICAgICAgc3BhY2U6IHNwYWNlSWQsXG4gICAgICAgIG5hbWU6ICdhZG1pbidcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxLFxuICAgICAgICAgIGFzc2lnbmVkX2FwcHM6IDFcbiAgICAgICAgfVxuICAgICAgfSkgfHwgbnVsbDtcbiAgICAgIHBzZXRzVXNlciA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fc2V0XCIpLmZpbmRPbmUoe1xuICAgICAgICBzcGFjZTogc3BhY2VJZCxcbiAgICAgICAgbmFtZTogJ3VzZXInXG4gICAgICB9LCB7XG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIF9pZDogMSxcbiAgICAgICAgICBhc3NpZ25lZF9hcHBzOiAxXG4gICAgICAgIH1cbiAgICAgIH0pIHx8IG51bGw7XG4gICAgICBwc2V0c01lbWJlciA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fc2V0XCIpLmZpbmRPbmUoe1xuICAgICAgICBzcGFjZTogc3BhY2VJZCxcbiAgICAgICAgbmFtZTogJ21lbWJlcidcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxLFxuICAgICAgICAgIGFzc2lnbmVkX2FwcHM6IDFcbiAgICAgICAgfVxuICAgICAgfSkgfHwgbnVsbDtcbiAgICAgIHBzZXRzR3Vlc3QgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtcbiAgICAgICAgc3BhY2U6IHNwYWNlSWQsXG4gICAgICAgIG5hbWU6ICdndWVzdCdcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxLFxuICAgICAgICAgIGFzc2lnbmVkX2FwcHM6IDFcbiAgICAgICAgfVxuICAgICAgfSkgfHwgbnVsbDtcbiAgICAgIHBzZXRzU3VwcGxpZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtcbiAgICAgICAgc3BhY2U6IHNwYWNlSWQsXG4gICAgICAgIG5hbWU6ICdzdXBwbGllcidcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxLFxuICAgICAgICAgIGFzc2lnbmVkX2FwcHM6IDFcbiAgICAgICAgfVxuICAgICAgfSkgfHwgbnVsbDtcbiAgICAgIHBzZXRzQ3VzdG9tZXIgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX3NldFwiKS5maW5kT25lKHtcbiAgICAgICAgc3BhY2U6IHNwYWNlSWQsXG4gICAgICAgIG5hbWU6ICdjdXN0b21lcidcbiAgICAgIH0sIHtcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgX2lkOiAxLFxuICAgICAgICAgIGFzc2lnbmVkX2FwcHM6IDFcbiAgICAgICAgfVxuICAgICAgfSkgfHwgbnVsbDtcbiAgICAgIGlmIChzcGFjZVVzZXIgJiYgc3BhY2VVc2VyLnByb2ZpbGUpIHtcbiAgICAgICAgcHNldHNDdXJyZW50ID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9zZXRcIikuZmluZCh7XG4gICAgICAgICAgc3BhY2U6IHNwYWNlSWQsXG4gICAgICAgICAgJG9yOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHVzZXJzOiB1c2VySWRcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgbmFtZTogc3BhY2VVc2VyLnByb2ZpbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgIF9pZDogMSxcbiAgICAgICAgICAgIGFzc2lnbmVkX2FwcHM6IDEsXG4gICAgICAgICAgICBuYW1lOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9KS5mZXRjaCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHNldHNDdXJyZW50ID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9zZXRcIikuZmluZCh7XG4gICAgICAgICAgdXNlcnM6IHVzZXJJZCxcbiAgICAgICAgICBzcGFjZTogc3BhY2VJZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICBfaWQ6IDEsXG4gICAgICAgICAgICBhc3NpZ25lZF9hcHBzOiAxLFxuICAgICAgICAgICAgbmFtZTogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuZmV0Y2goKTtcbiAgICAgIH1cbiAgICAgIHBzZXRzQWRtaW5fcG9zID0gbnVsbDtcbiAgICAgIHBzZXRzVXNlcl9wb3MgPSBudWxsO1xuICAgICAgcHNldHNNZW1iZXJfcG9zID0gbnVsbDtcbiAgICAgIHBzZXRzR3Vlc3RfcG9zID0gbnVsbDtcbiAgICAgIHBzZXRzQ3VycmVudF9wb3MgPSBudWxsO1xuICAgICAgcHNldHNTdXBwbGllcl9wb3MgPSBudWxsO1xuICAgICAgcHNldHNDdXN0b21lcl9wb3MgPSBudWxsO1xuICAgICAgaWYgKHBzZXRzQWRtaW4gIT0gbnVsbCA/IHBzZXRzQWRtaW4uX2lkIDogdm9pZCAwKSB7XG4gICAgICAgIHBzZXRzQWRtaW5fcG9zID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9vYmplY3RzXCIpLmZpbmQoe1xuICAgICAgICAgIHBlcm1pc3Npb25fc2V0X2lkOiBwc2V0c0FkbWluLl9pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICBjcmVhdGVkOiAwLFxuICAgICAgICAgICAgbW9kaWZpZWQ6IDAsXG4gICAgICAgICAgICBjcmVhdGVkX2J5OiAwLFxuICAgICAgICAgICAgbW9kaWZpZWRfYnk6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmZldGNoKCk7XG4gICAgICB9XG4gICAgICBpZiAocHNldHNVc2VyICE9IG51bGwgPyBwc2V0c1VzZXIuX2lkIDogdm9pZCAwKSB7XG4gICAgICAgIHBzZXRzVXNlcl9wb3MgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX29iamVjdHNcIikuZmluZCh7XG4gICAgICAgICAgcGVybWlzc2lvbl9zZXRfaWQ6IHBzZXRzVXNlci5faWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgY3JlYXRlZDogMCxcbiAgICAgICAgICAgIG1vZGlmaWVkOiAwLFxuICAgICAgICAgICAgY3JlYXRlZF9ieTogMCxcbiAgICAgICAgICAgIG1vZGlmaWVkX2J5OiAwXG4gICAgICAgICAgfVxuICAgICAgICB9KS5mZXRjaCgpO1xuICAgICAgfVxuICAgICAgaWYgKHBzZXRzTWVtYmVyICE9IG51bGwgPyBwc2V0c01lbWJlci5faWQgOiB2b2lkIDApIHtcbiAgICAgICAgcHNldHNNZW1iZXJfcG9zID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9vYmplY3RzXCIpLmZpbmQoe1xuICAgICAgICAgIHBlcm1pc3Npb25fc2V0X2lkOiBwc2V0c01lbWJlci5faWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgY3JlYXRlZDogMCxcbiAgICAgICAgICAgIG1vZGlmaWVkOiAwLFxuICAgICAgICAgICAgY3JlYXRlZF9ieTogMCxcbiAgICAgICAgICAgIG1vZGlmaWVkX2J5OiAwXG4gICAgICAgICAgfVxuICAgICAgICB9KS5mZXRjaCgpO1xuICAgICAgfVxuICAgICAgaWYgKHBzZXRzR3Vlc3QgIT0gbnVsbCA/IHBzZXRzR3Vlc3QuX2lkIDogdm9pZCAwKSB7XG4gICAgICAgIHBzZXRzR3Vlc3RfcG9zID0gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwicGVybWlzc2lvbl9vYmplY3RzXCIpLmZpbmQoe1xuICAgICAgICAgIHBlcm1pc3Npb25fc2V0X2lkOiBwc2V0c0d1ZXN0Ll9pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICBjcmVhdGVkOiAwLFxuICAgICAgICAgICAgbW9kaWZpZWQ6IDAsXG4gICAgICAgICAgICBjcmVhdGVkX2J5OiAwLFxuICAgICAgICAgICAgbW9kaWZpZWRfYnk6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmZldGNoKCk7XG4gICAgICB9XG4gICAgICBpZiAocHNldHNTdXBwbGllciAhPSBudWxsID8gcHNldHNTdXBwbGllci5faWQgOiB2b2lkIDApIHtcbiAgICAgICAgcHNldHNTdXBwbGllcl9wb3MgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX29iamVjdHNcIikuZmluZCh7XG4gICAgICAgICAgcGVybWlzc2lvbl9zZXRfaWQ6IHBzZXRzU3VwcGxpZXIuX2lkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICAgIGNyZWF0ZWQ6IDAsXG4gICAgICAgICAgICBtb2RpZmllZDogMCxcbiAgICAgICAgICAgIGNyZWF0ZWRfYnk6IDAsXG4gICAgICAgICAgICBtb2RpZmllZF9ieTogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSkuZmV0Y2goKTtcbiAgICAgIH1cbiAgICAgIGlmIChwc2V0c0N1c3RvbWVyICE9IG51bGwgPyBwc2V0c0N1c3RvbWVyLl9pZCA6IHZvaWQgMCkge1xuICAgICAgICBwc2V0c0N1c3RvbWVyX3BvcyA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInBlcm1pc3Npb25fb2JqZWN0c1wiKS5maW5kKHtcbiAgICAgICAgICBwZXJtaXNzaW9uX3NldF9pZDogcHNldHNDdXN0b21lci5faWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgY3JlYXRlZDogMCxcbiAgICAgICAgICAgIG1vZGlmaWVkOiAwLFxuICAgICAgICAgICAgY3JlYXRlZF9ieTogMCxcbiAgICAgICAgICAgIG1vZGlmaWVkX2J5OiAwXG4gICAgICAgICAgfVxuICAgICAgICB9KS5mZXRjaCgpO1xuICAgICAgfVxuICAgICAgaWYgKHBzZXRzQ3VycmVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHNldF9pZHMgPSBfLnBsdWNrKHBzZXRzQ3VycmVudCwgXCJfaWRcIik7XG4gICAgICAgIHBzZXRzQ3VycmVudF9wb3MgPSBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJwZXJtaXNzaW9uX29iamVjdHNcIikuZmluZCh7XG4gICAgICAgICAgcGVybWlzc2lvbl9zZXRfaWQ6IHtcbiAgICAgICAgICAgICRpbjogc2V0X2lkc1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuZmV0Y2goKTtcbiAgICAgICAgcHNldHNDdXJyZW50TmFtZXMgPSBfLnBsdWNrKHBzZXRzQ3VycmVudCwgXCJuYW1lXCIpO1xuICAgICAgfVxuICAgICAgcHNldHMgPSB7XG4gICAgICAgIHBzZXRzQWRtaW46IHBzZXRzQWRtaW4sXG4gICAgICAgIHBzZXRzVXNlcjogcHNldHNVc2VyLFxuICAgICAgICBwc2V0c0N1cnJlbnQ6IHBzZXRzQ3VycmVudCxcbiAgICAgICAgcHNldHNNZW1iZXI6IHBzZXRzTWVtYmVyLFxuICAgICAgICBwc2V0c0d1ZXN0OiBwc2V0c0d1ZXN0LFxuICAgICAgICBwc2V0c1N1cHBsaWVyOiBwc2V0c1N1cHBsaWVyLFxuICAgICAgICBwc2V0c0N1c3RvbWVyOiBwc2V0c0N1c3RvbWVyLFxuICAgICAgICBpc1NwYWNlQWRtaW46IGlzU3BhY2VBZG1pbixcbiAgICAgICAgc3BhY2VVc2VyOiBzcGFjZVVzZXIsXG4gICAgICAgIHBzZXRzQWRtaW5fcG9zOiBwc2V0c0FkbWluX3BvcyxcbiAgICAgICAgcHNldHNVc2VyX3BvczogcHNldHNVc2VyX3BvcyxcbiAgICAgICAgcHNldHNNZW1iZXJfcG9zOiBwc2V0c01lbWJlcl9wb3MsXG4gICAgICAgIHBzZXRzR3Vlc3RfcG9zOiBwc2V0c0d1ZXN0X3BvcyxcbiAgICAgICAgcHNldHNTdXBwbGllcl9wb3M6IHBzZXRzU3VwcGxpZXJfcG9zLFxuICAgICAgICBwc2V0c0N1c3RvbWVyX3BvczogcHNldHNDdXN0b21lcl9wb3MsXG4gICAgICAgIHBzZXRzQ3VycmVudF9wb3M6IHBzZXRzQ3VycmVudF9wb3NcbiAgICAgIH07XG4gICAgICBpZiAoaXNTcGFjZUFkbWluIHx8IF9vYmplY3QuaW5fZGV2ZWxvcG1lbnQgPT09ICcwJyAmJiBfb2JqZWN0LmlzX2VuYWJsZSkge1xuICAgICAgICBpZiAoX29iamVjdC5kYXRhc291cmNlICE9PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICBhdXRoVG9rZW4gPSBTdGVlZG9zLmdldEF1dGhUb2tlbihyZXEsIHJlcyk7XG4gICAgICAgICAgdXNlclNlc3Npb24gPSBNZXRlb3Iud3JhcEFzeW5jKGZ1bmN0aW9uKGF1dGhUb2tlbiwgc3BhY2VJZCwgY2IpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGVlZG9zQXV0aC5nZXRTZXNzaW9uKGF1dGhUb2tlbiwgc3BhY2VJZCkudGhlbihmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNiKHJlamVjdCwgcmVzb2x2ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KShhdXRoVG9rZW4sIHNwYWNlSWQpO1xuICAgICAgICAgIHBlcm1pc3Npb25zID0gTWV0ZW9yLndyYXBBc3luYyhmdW5jdGlvbih2LCB1c2VyU2Vzc2lvbiwgY2IpIHtcbiAgICAgICAgICAgIHJldHVybiB2LmdldFVzZXJPYmplY3RQZXJtaXNzaW9uKHVzZXJTZXNzaW9uKS50aGVuKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2IocmVqZWN0LCByZXNvbHZlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIG9iamVjdCA9IENyZWF0b3IuY29udmVydE9iamVjdChjbG9uZShvYmplY3RxbC5nZXRPYmplY3QoX29iamVjdC5uYW1lKS50b0NvbmZpZygpKSwgc3BhY2VJZCk7XG4gICAgICAgICAgb2JqZWN0LmRhdGFiYXNlX25hbWUgPSAocmVmMSA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcImRhdGFzb3VyY2VzXCIpLmZpbmRPbmUoe1xuICAgICAgICAgICAgX2lkOiBfb2JqZWN0LmRhdGFzb3VyY2VcbiAgICAgICAgICB9KSkgIT0gbnVsbCA/IHJlZjEubGFiZWwgOiB2b2lkIDA7XG4gICAgICAgICAgb2JqZWN0LnBlcm1pc3Npb25zID0gcGVybWlzc2lvbnMob2JqZWN0cWwuZ2V0T2JqZWN0KF9vYmplY3QubmFtZSksIHVzZXJTZXNzaW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmplY3QgPSBDcmVhdG9yLmNvbnZlcnRPYmplY3QoY2xvbmUoQ3JlYXRvci5PYmplY3RzW19vYmplY3QubmFtZV0pLCBzcGFjZUlkKTtcbiAgICAgICAgICBvYmplY3QucGVybWlzc2lvbnMgPSBDcmVhdG9yLmdldE9iamVjdFBlcm1pc3Npb25zLmJpbmQocHNldHMpKHNwYWNlSWQsIHVzZXJJZCwgb2JqZWN0Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBvYmplY3QuZGI7XG4gICAgICAgIG9iamVjdC5saXN0X3ZpZXdzID0gQ3JlYXRvci5nZXRVc2VyT2JqZWN0TGlzdFZpZXdzKHVzZXJJZCwgc3BhY2VJZCwgb2JqZWN0Lm5hbWUpO1xuICAgICAgICBsbmcgPSBfZ2V0TG9jYWxlKGRiLnVzZXJzLmZpbmRPbmUodXNlcklkLCB7XG4gICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICBsb2NhbGU6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgc3RlZWRvc0kxOG4udHJhbnNsYXRpb25PYmplY3QobG5nLCBvYmplY3QubmFtZSwgT2JqZWN0LmFzc2lnbihvYmplY3QsIHtcbiAgICAgICAgICBkYXRhc291cmNlOiBfb2JqZWN0LmRhdGFzb3VyY2VcbiAgICAgICAgfSkpO1xuICAgICAgICBvYmplY3RMYXlvdXQgPSBnZXRVc2VyUHJvZmlsZU9iamVjdExheW91dCh1c2VySWQsIHNwYWNlSWQsIG9iamVjdC5uYW1lKTtcbiAgICAgICAgaWYgKG9iamVjdExheW91dCkge1xuICAgICAgICAgIF9maWVsZHMgPSB7fTtcbiAgICAgICAgICBfLmVhY2gob2JqZWN0TGF5b3V0LmZpZWxkcywgZnVuY3Rpb24oX2l0ZW0pIHtcbiAgICAgICAgICAgIF9maWVsZHNbX2l0ZW0uZmllbGRdID0gb2JqZWN0LmZpZWxkc1tfaXRlbS5maWVsZF07XG4gICAgICAgICAgICBpZiAoXy5oYXMoX2l0ZW0sICdncm91cCcpKSB7XG4gICAgICAgICAgICAgIF9maWVsZHNbX2l0ZW0uZmllbGRdLmdyb3VwID0gX2l0ZW0uZ3JvdXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoX2l0ZW0ucmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgX2ZpZWxkc1tfaXRlbS5maWVsZF0ucmVhZG9ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgX2ZpZWxkc1tfaXRlbS5maWVsZF0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9maWVsZHNbX2l0ZW0uZmllbGRdLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX2l0ZW0ucmVhZG9ubHkpIHtcbiAgICAgICAgICAgICAgX2ZpZWxkc1tfaXRlbS5maWVsZF0ucmVhZG9ubHkgPSB0cnVlO1xuICAgICAgICAgICAgICBfZmllbGRzW19pdGVtLmZpZWxkXS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybiBfZmllbGRzW19pdGVtLmZpZWxkXS5yZXF1aXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIG9iamVjdC5maWVsZHMgPSBfZmllbGRzO1xuICAgICAgICAgIG9iamVjdC5hbGxvd19hY3Rpb25zID0gb2JqZWN0TGF5b3V0LmFjdGlvbnMgfHwgW107XG4gICAgICAgICAgb2JqZWN0LmFsbG93X3JlbGF0ZWRMaXN0ID0gb2JqZWN0TGF5b3V0LnJlbGF0ZWRMaXN0IHx8IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBKc29uUm91dGVzLnNlbmRSZXN1bHQocmVzLCB7XG4gICAgICBjb2RlOiAyMDAsXG4gICAgICBkYXRhOiBvYmplY3RcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBlID0gZXJyb3I7XG4gICAgY29uc29sZS5lcnJvcihlLnN0YWNrKTtcbiAgICByZXR1cm4gSnNvblJvdXRlcy5zZW5kUmVzdWx0KHJlcywge1xuICAgICAgY29kZTogMjAwLFxuICAgICAgZGF0YToge1xuICAgICAgICBlcnJvcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGUucmVhc29uIHx8IGUubWVzc2FnZVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59KTtcbiIsIm9iamVjdHFsID0gcmVxdWlyZShcIkBzdGVlZG9zL29iamVjdHFsXCIpO1xyXG5NZXRlb3IucHVibGlzaCBcImNyZWF0b3Jfb2JqZWN0c1wiLCAoc3BhY2UpLT5cclxuXHQjVE9ETyDmoLnmja7mnYPpmZDov5Tlm55PYmplY3Rz6K6w5b2VXHJcblx0Y29uZmlnID0gb2JqZWN0cWwuZ2V0U3RlZWRvc0NvbmZpZygpO1xyXG5cdGlmIGNvbmZpZy50ZW5hbnQgJiYgY29uZmlnLnRlbmFudC5zYWFzXHJcblx0XHRyZXR1cm5cclxuXHRDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJvYmplY3RzXCIpLmZpbmQoe3NwYWNlOiB7JGluOiBbbnVsbCwgc3BhY2VdfSwgaXNfZGVsZXRlZDogeyRuZTogdHJ1ZX19LCB7ZmllbGRzOiB7X2lkOiAxLCBtb2RpZmllZDogMSwgaXNfZW5hYmxlOiAxLCBpbl9kZXZlbG9wbWVudDogMX19KSIsInZhciBvYmplY3RxbDtcblxub2JqZWN0cWwgPSByZXF1aXJlKFwiQHN0ZWVkb3Mvb2JqZWN0cWxcIik7XG5cbk1ldGVvci5wdWJsaXNoKFwiY3JlYXRvcl9vYmplY3RzXCIsIGZ1bmN0aW9uKHNwYWNlKSB7XG4gIHZhciBjb25maWc7XG4gIGNvbmZpZyA9IG9iamVjdHFsLmdldFN0ZWVkb3NDb25maWcoKTtcbiAgaWYgKGNvbmZpZy50ZW5hbnQgJiYgY29uZmlnLnRlbmFudC5zYWFzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBDcmVhdG9yLmdldENvbGxlY3Rpb24oXCJvYmplY3RzXCIpLmZpbmQoe1xuICAgIHNwYWNlOiB7XG4gICAgICAkaW46IFtudWxsLCBzcGFjZV1cbiAgICB9LFxuICAgIGlzX2RlbGV0ZWQ6IHtcbiAgICAgICRuZTogdHJ1ZVxuICAgIH1cbiAgfSwge1xuICAgIGZpZWxkczoge1xuICAgICAgX2lkOiAxLFxuICAgICAgbW9kaWZpZWQ6IDEsXG4gICAgICBpc19lbmFibGU6IDEsXG4gICAgICBpbl9kZXZlbG9wbWVudDogMVxuICAgIH1cbiAgfSk7XG59KTtcbiIsIk1ldGVvci5wdWJsaXNoIFwicHVibGlzaF9vYmplY3RfbGF5b3V0c1wiLCAoc3BhY2UpLT5cclxuXHR1c2VySWQgPSB0aGlzLnVzZXJJZFxyXG5cdGlmICF1c2VySWRcclxuXHRcdHJldHVyblxyXG5cdHNwYWNlVXNlciA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInNwYWNlX3VzZXJzXCIpLmZpbmRPbmUoe3NwYWNlOiBzcGFjZSwgdXNlcjogdXNlcklkfSwge2ZpZWxkczoge3Byb2ZpbGU6IDF9fSlcclxuXHRpZiBzcGFjZVVzZXIgJiYgc3BhY2VVc2VyLnByb2ZpbGVcclxuXHRcdENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcIm9iamVjdF9sYXlvdXRzXCIpLmZpbmQoe3NwYWNlOiB7JGluOiBbbnVsbCwgc3BhY2VdfSwgcHJvZmlsZXM6IHNwYWNlVXNlci5wcm9maWxlfSwge2ZpZWxkczoge19pZDogMSwgbW9kaWZpZWQ6IDEsIG9iamVjdF9uYW1lOiAxfX0pIiwiTWV0ZW9yLnB1Ymxpc2goXCJwdWJsaXNoX29iamVjdF9sYXlvdXRzXCIsIGZ1bmN0aW9uKHNwYWNlKSB7XG4gIHZhciBzcGFjZVVzZXIsIHVzZXJJZDtcbiAgdXNlcklkID0gdGhpcy51c2VySWQ7XG4gIGlmICghdXNlcklkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNwYWNlVXNlciA9IENyZWF0b3IuZ2V0Q29sbGVjdGlvbihcInNwYWNlX3VzZXJzXCIpLmZpbmRPbmUoe1xuICAgIHNwYWNlOiBzcGFjZSxcbiAgICB1c2VyOiB1c2VySWRcbiAgfSwge1xuICAgIGZpZWxkczoge1xuICAgICAgcHJvZmlsZTogMVxuICAgIH1cbiAgfSk7XG4gIGlmIChzcGFjZVVzZXIgJiYgc3BhY2VVc2VyLnByb2ZpbGUpIHtcbiAgICByZXR1cm4gQ3JlYXRvci5nZXRDb2xsZWN0aW9uKFwib2JqZWN0X2xheW91dHNcIikuZmluZCh7XG4gICAgICBzcGFjZToge1xuICAgICAgICAkaW46IFtudWxsLCBzcGFjZV1cbiAgICAgIH0sXG4gICAgICBwcm9maWxlczogc3BhY2VVc2VyLnByb2ZpbGVcbiAgICB9LCB7XG4gICAgICBmaWVsZHM6IHtcbiAgICAgICAgX2lkOiAxLFxuICAgICAgICBtb2RpZmllZDogMSxcbiAgICAgICAgb2JqZWN0X25hbWU6IDFcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSk7XG4iXX0=
