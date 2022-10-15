/**
 * @fix by NDK
 * update as 16/10 2022
 * do not remove the author name to get more updates
 */

"use strict";

var utils = require("../utils");
var log = require("npmlog");

function formatData(resData) {
    return {
        viewer_feedback_reaction_info: resData.feedback_react.feedback.viewer_feedback_reaction_info,
        supported_reactions: resData.feedback_react.feedback.supported_reactions,
        top_reactions: resData.feedback_react.feedback.top_reactions.edges,
        reaction_count: resData.feedback_react.feedback.reaction_count
    };
}

module.exports = function(defaultFuncs, api, ctx) {
    return function setPostReaction(postID, type, callback) {
        var resolveFunc = function() {};
        var rejectFunc = function() {};
        var returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            if (utils.getType(type) === "Function" || utils.getType(type) === "AsyncFunction") {
                callback = type;
                type = 0;
            } else {
                callback = function(err, data) {
                    if (err) {
                        return rejectFunc(err);
                    }
                    resolveFunc(data);
                };
            }
        }

        var map = {
            unlike: 0,
            like: 1635855486666999,
            angry: 444813342392137,
            love: 1678524932434102,
            haha: 115940658764963,
            wow: 478547315650144,
            sad: 908563459236466,
            care: 613557422527858
        };

        if (utils.getType(type) !== "Number" && utils.getType(type) === "String") {
            type = map[type.toLowerCase()];
        } else {
            throw {
                error: "setPostReaction: Invalid reaction type"
            };
        }

        var form = {
            av: ctx.userID,
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "CometUFIFeedbackReactMutation",
            doc_id: "5703418209680126",
            variables: JSON.stringify({
                input: {
                    actor_id: ctx.userID,
                    feedback_id: (new Buffer.from("feedback:" + postID)).toString("base64"),
                    feedback_reaction_id: type,
                    feedback_source: "OBJECT",
                    is_tracking_encrypted: true,
                    tracking: [],
                    session_id: "0a229e90-a36a-416e-98a0-d7311a069c5c",
                    client_mutation_id: Math.round(Math.random() * 19).toString()
                },
                useDefaultActor: false,
                scale: 1
            })
        };

        defaultFuncs
            .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function(resData) {
                if (resData.errors) {
                    throw resData;
                }
                return callback(null, formatData(resData.data));
            })
            .catch(function(err) {
                log.error("setPostReaction", err);
                return callback(err);
            });

        return returnPromise;
    };
};