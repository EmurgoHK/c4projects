import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { News } from "./news";

import { isModerator } from "../user/methods";
import { isTesting } from "../utilities";
import { notifySubscribers } from "../notifications/methods";
import { Projects } from "../projects/projects";

export const addNews = new ValidatedMethod({
  name: "addNews",
  validate: new SimpleSchema({
    headline: {
      type: String,
      max: 90,
      optional: false,
    },
    description: {
      type: String,
      // max: 260,
      optional: false,
    },
    readMoreURL: {
      type: String,
      optional: true,
    },
    type: {
      type: String,
      optional: false,
    },
    projectId: {
      type: String,
      optional: false,
    },
    captcha: {
      type: String,
      optional: isTesting,
    },
  }).validator({
    clean: true,
  }),
  run(data) {
    if (Meteor.isServer) {
      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      if (!isTesting) {
        var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, data.captcha);

        if (!verifyCaptchaResponse.success) {
          throw new Meteor.Error("messages.recaptcha");
        }
      }

      const project = Projects.findOne({_id: data.projectId});
      if (!project) {
        throw new Meteor.Error("Error.", "messages.news.no_project");
      }

      data.createdBy = Meteor.userId();
      data.createdAt = new Date().getTime();

      const id = News.insert(data);
      const newDoc = News.findOne(id);

      notifySubscribers(data.projectId, `News posted about ${project.headline}`, undefined, `/news/${newDoc.slug}`, 'newsPosted');

      return id;
    }
  },
});

export const deleteNews = new ValidatedMethod({
  name: "deleteNews",
  validate: new SimpleSchema({
    newsId: {
      type: String,
      optional: false,
    },
  }).validator(),
  run({ newsId }) {
    if (Meteor.isServer) {
      let news = News.findOne({ _id: newsId });

      if (!news) {
        throw new Meteor.Error("Error.", "messages.news.no_news");
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      if (news.createdBy !== Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.news.cant_remove");
      }

      return News.remove({ _id: newsId });
    }
  },
});

export const editNews = new ValidatedMethod({
  name: "editNews",
  validate: new SimpleSchema({
    newsId: {
      type: String,
      optional: false,
    },
    headline: {
      type: String,
      max: 90,
      optional: false,
    },
    description: {
      type: String,
      // max: 260,
      optional: false,
    },
    readMoreURL: {
      type: String,
      optional: true,
    },
    type: {
      type: String,
      optional: false,
    },
    captcha: {
      type: String,
      optional: isTesting,
    },
  }).validator({
    clean: true,
  }),
  run({ newsId, headline, description, readMoreURL, type, captcha, projectId }) {
    if (Meteor.isServer) {
      let news = News.findOne({ _id: newsId });

      if (!news) {
        throw new Meteor.Error("Error.", "messages.news.no_project");
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      if (news.createdBy !== Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.news.cant_edit");
      }

      if (!isTesting) {
        var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);

        if (!verifyCaptchaResponse.success) {
          throw new Meteor.Error("recaptcha failed please try again");
        }
      }

      News.update(
        {
          _id: newsId,
        },
        {
          $set: {
            headline,
            description,
            readMoreURL,
            projectId,
            type,
            updatedAt: new Date().getTime(),
          },
        }
      );
    }
  },
});

export const flagNews = new ValidatedMethod({
  name: "flagNews",
  validate: new SimpleSchema({
    newsId: {
      type: String,
      optional: false,
    },
    reason: {
      type: String,
      max: 1000,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ newsId, reason }) {
    let news = News.findOne({
      _id: newsId,
    });

    if (!news) {
      throw new Meteor.Error("Error.", "messages.news.no_news");
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if ((news.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
      throw new Meteor.Error("Error.", "messages.already_flagged");
    }

    return News.update(
      {
        _id: newsId,
      },
      {
        $push: {
          flags: {
            reason: reason,
            flaggedBy: Meteor.userId(),
            flaggedAt: new Date().getTime(),
          },
        },
      }
    );
  },
});

export const resolveNewsFlags = new ValidatedMethod({
  name: "resolveNewsFlags",
  validate: new SimpleSchema({
    newsId: {
      type: String,
      optional: false,
    },
    decision: {
      type: String,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ newsId, decision }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error("Error.", "messages.moderator");
    }

    let news = News.findOne({
      _id: newsId,
    });

    if (!news) {
      throw new Meteor.Error("Error.", "messages.news.no_project");
    }

    if (decision === "ignore") {
      return News.update(
        {
          _id: newsId,
        },
        {
          $set: {
            flags: [],
          },
        }
      );
    } else {
      return News.remove({
        _id: newsId,
      });
    }
  },
});

if (Meteor.isDevelopment) {
  Meteor.methods({
    generateTestFlaggedNews: () => {
      for (let i = 0; i < 2; i++) {
        News.insert({
          headline: `Testing 123`,
          description: "Test",
          createdBy: "test",
          createdAt: new Date().getTime(),
          projectId: "testProjectId",
          flags: [
            {
              reason: "testReason",
              flaggedBy: "test",
              flaggedAt: new Date().getTime(),
            },
          ],
        });
      }
    },
  });
}
