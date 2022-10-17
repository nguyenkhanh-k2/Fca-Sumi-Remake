/**
 * @add by NDK
 * update as !9/10/2022
 * do not remove the author name to get more updates
 */

 "use strict";

 var utils = require("../utils");
 var log = require("npmlog");
 
 
 module.exports = function(defaultFuncs, api, ctx) {
   return function setUnblockUser(userID, callback) {
     var resolveFunc = function(){};
     var rejectFunc = function(){};
     var returnPromise = new Promise(function (resolve, reject) {
       resolveFunc = resolve;
       rejectFunc = reject;
     });
 
     if (!callback) {
         callback = function (err, data) {
           if (err) {
             return rejectFunc(err);
           }
           resolveFunc(data);
         };
     }
 
     
     var form = {
       av: ctx.userID,
       fb_api_caller_class: "RelayModern",
       fb_api_req_friendly_name: "BlockingSettingsBlockMutation",
       doc_id: "7455148737860258",
       variables: JSON.stringify({
         input: {
           actor_id: ctx.userID,
           block_action: "UNBLOCK",
           setting: "USER",
           target_id: userID,
           client_mutation_id: Math.round(Math.random() * 19).toString()
         },
         profile_picture_size: 36
       })
     };
 
     defaultFuncs
       .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
       .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
       .then(function(resData) {
         if (resData.errors) {
           throw resData;
         }
         return callback(null, resData.data);
       })
       .catch(function(err) {
         log.error("setUnblockUser", err);
         return callback(err);
       });
 
     return returnPromise;
   };
 };
