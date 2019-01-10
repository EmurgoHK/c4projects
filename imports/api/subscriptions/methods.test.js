import { assert } from "chai";
import { Meteor } from "meteor/meteor";

import { Subscriptions } from "./subscriptions";

import { callWithPromise } from "../utilities";

import "./methods";

Meteor.userId = () => "test-user"; // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ name: "Test User", moderator: true }); // stub user data as well
Meteor.user = () => ({ name: "Test User", moderator: true });

describe("Subscription methods", () => {
  it("user can subscribe", () => {
    return callWithPromise("subscribe", {
      articleId: 'testId',
    }).then(data => {
      let sub = Subscriptions.findOne({
        _id: 'testId',
      });

      assert.ok(sub);

      assert.equal(sub._id, 'testId');
      assert.lengthOf(sub.users, 1);

      assert.include(sub.users, "test-user");
    });
  });

  it("user can unsubscribe", () => {
    return callWithPromise("unsubscribe", {
      articleId: 'testId',
    }).then(data => {
      let sub = Subscriptions.findOne({
        _id: 'testId'
      });

      assert.ok(sub);

      assert.equal(sub._id, 'testId');
      assert.lengthOf(sub.users, 0);
      assert.notInclude(sub.users, "test-user");
    });
  });

  after(function() {
    Subscriptions.remove({});
  });
});
