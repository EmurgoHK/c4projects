import { chai, assert } from "chai";
import { Meteor } from "meteor/meteor";

import { Comments } from "./comments";
import { callWithPromise } from "/imports/api/utilities";

import "./methods";

Meteor.userId = () => "test-user"; // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ _id: "test-user", profile: { name: "Test User" }, moderator: true }); // stub user data as well
Meteor.user = () => ({ _id: "test-user", profile: { name: "Test User" }, moderator: true });

describe("comments methods", () => {
  it("user can add a new comment", () => {
    return callWithPromise("newComment", {
      text: "Test text",
      parentId: "newsId",
      articleId: "newsId",
    }).then(data => {
      let comment = Comments.findOne({
        _id: data,
      });

      assert.ok(comment);

      assert.equal(comment.text, "Test text");
      assert.equal(comment.parentId, "newsId");
      assert.equal(comment.articleId, "newsId");
    });
  });

  it("user can add a nested comment", () => {
    let comment = Comments.findOne({});

    return callWithPromise("newComment", {
      text: "Test text",
      parentId: comment._id,
      articleId: "newsId",
    }).then(data => {
      let commentN = Comments.findOne({
        _id: data,
      });

      assert.ok(commentN);

      assert.equal(commentN.text, "Test text");
      assert.equal(commentN.parentId, comment._id);
      assert.equal(commentN.articleId, "newsId");
    });
  });

  it("user cannot add a new comment if data is missing", () => {
    return callWithPromise("newComment", {
      articleId: "newsId",
      text: "",
    })
      .then(data => {})
      .catch(error => {
        assert.ok(error);
      });
  });

  it("user can edit a comment", () => {
    let comment = Comments.findOne({});

    assert.ok(comment);

    return callWithPromise("editComment", {
      commentId: comment._id,
      text: "Text test 2",
    }).then(data => {
      let c2 = Comments.findOne({
        _id: comment._id,
      });

      assert.ok(c2);

      assert.equal(c2.text, "Text test 2");
    });
  });

  it("user cannot edit a comment the he/she didn't create", () => {
    let comment = Comments.insert({
      articleId: "newsId",
      parentId: "newsId",
      text: "abc",
      createdBy: "not-me",
      createdAt: new Date().getTime(),
    });

    assert.ok(comment);

    return callWithPromise("editComment", {
      commentId: comment,
      text: "Text test 2",
    })
      .then(data => {})
      .catch(error => {
        assert.ok(error);
      });
  });

  it("user can flag a comment", () => {
    let comment = Comments.insert({
      articleId: "newsId",
      parentId: "newsId",
      text: "abc",
      createdBy: "not-me",
      createdAt: new Date().getTime(),
    });

    assert.ok(comment);

    return callWithPromise(
      "flagComment",
      {
        commentId: comment,
        reason: "Test reason",
      },
      (err, data) => {
        let c2 = Comments.findOne({
          _id: comment,
        });

        assert.ok(c2);

        assert.isAbove(c2.flags.length, 0);
        assert.equal(c2.flags[0].reason, "Test reason");
      }
    );
  });

  it("moderator can remove a flagged comment", () => {
    let comment = Comments.findOne({
      flags: {
        $exists: true,
      },
    });

    assert.ok(comment);

    return callWithPromise(
      "resolveCommentFlags",
      {
        commentId: comment._id,
        decision: "remove",
      },
      (err, data) => {
        let c2 = Comments.findOne({
          _id: comment._id,
        });

        assert.notOk(c2);
      }
    );
  });

  it("user can remove a comment", () => {
    let comment = Comments.findOne({
      createdBy: Meteor.userId(),
    });

    assert.ok(comment);

    return callWithPromise("removeComment", {
      commentId: comment._id,
    }).then(data => {
      let c2 = Comments.findOne({
        _id: comment._id,
      });

      assert.notOk(c2);

      let children = Comments.find({
        parentId: comment._id,
      }).fetch();

      if (children.length) {
        for (let i = 0; i < children.length; i++) {
          assert.ok(children[i].parentId === comment.parentId);
        }
      }
    });
  });

  it("user cannot remove a comment that he/she didn't create", () => {
    let comment = Comments.findOne({});

    assert.ok(comment);

    return callWithPromise("removeComment", {
      commentId: comment._id,
    })
      .then(data => {})
      .catch(error => {
        assert.ok(error);
      });
  });

  after(function() {
    Comments.remove({});
  });
});
