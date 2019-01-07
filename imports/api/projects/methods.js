import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Projects } from "./projects";

import { isModerator } from "../user/methods";
import { isTesting } from "../utilities";
import { addNews } from "../news/methods";

export const addProject = new ValidatedMethod({
  name: "addProject",
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
    github_url: {
      type: String,
      optional: true,
    },
    website: {
      type: String,
      optional: true,
    },
    language: {
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

      data.createdBy = Meteor.userId();
      data.createdAt = new Date().getTime();

      const id = Projects.insert(data);
      addNews.call({
        projectId: id,
        headline: `Project created: ${data.headline}`,
        description: `A new project was added called ${data.headline}`,
        type: 'project_created',
      });
      return id;
    }
  },
});

export const deleteProject = new ValidatedMethod({
  name: "deleteProject",
  validate: new SimpleSchema({
    projectId: {
      type: String,
      optional: false,
    },
  }).validator(),
  run({ projectId }) {
    if (Meteor.isServer) {
      let project = Projects.findOne({ _id: projectId });

      if (!project) {
        throw new Meteor.Error("Error.", "messages.projects.no_project");
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      if (project.createdBy !== Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.projects.cant_remove");
      }

      return Projects.remove({ _id: projectId });
    }
  },
});

export const editProject = new ValidatedMethod({
  name: "editProject",
  validate: new SimpleSchema({
    projectId: {
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
    github_url: {
      type: String,
      optional: true,
    },
    website: {
      type: String,
      optional: true,
    },
    captcha: {
      type: String,
      optional: isTesting,
    },
    type: {
      type: String,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ projectId, headline, description, github_url, website, captcha, tags, type }) {
    if (Meteor.isServer) {
      let project = Projects.findOne({ _id: projectId });

      if (!project) {
        throw new Meteor.Error("Error.", "messages.projects.no_project");
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.login");
      }

      if (project.createdBy !== Meteor.userId()) {
        throw new Meteor.Error("Error.", "messages.projects.cant_edit");
      }

      if (!isTesting) {
        var verifyCaptchaResponse = reCAPTCHA.verifyCaptcha(this.connection.clientAddress, captcha);

        if (!verifyCaptchaResponse.success) {
          throw new Meteor.Error("recaptcha failed please try again");
        }
      }

      Projects.update(
        {
          _id: projectId,
        },
        {
          $set: {
            headline: headline,
            description: description,
            github_url: github_url,
            website: website,
            tags: tags,
            type: type,
            updatedAt: new Date().getTime(),
          },
        }
      );
    }
  },
});

export const flagProject = new ValidatedMethod({
  name: "flagProject",
  validate: new SimpleSchema({
    projectId: {
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
  run({ projectId, reason }) {
    let project = Projects.findOne({
      _id: projectId,
    });

    if (!project) {
      throw new Meteor.Error("Error.", "messages.projects.no_project");
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if ((project.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
      throw new Meteor.Error("Error.", "messages.already_flagged");
    }

    return Projects.update(
      {
        _id: projectId,
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

export const proposeNewData = new ValidatedMethod({
  name: "proposeNewData",
  validate: new SimpleSchema({
    projectId: {
      type: String,
      optional: false,
    },
    datapoint: {
      type: String,
      optional: false,
    },
    newData: {
      type: String,
      optional: false,
    },
    type: {
      type: String,
      optional: true,
    },
  }).validator({
    clean: true,
  }),
  run({ projectId, datapoint, newData, type }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    let project = Projects.findOne({
      _id: projectId,
    });

    if (!project) {
      throw new Meteor.Error("Error.", "messages.projects.no_project");
    }

    if (project[datapoint]) {
      throw new Meteor.Error("Error.", "messages.projects.data");
    }

    Projects.update(
      {
        _id: project._id,
      },
      {
        $push: {
          edits: {
            _id: Random.id(10),
            proposedBy: Meteor.userId(),
            datapoint: datapoint,
            newData: newData,
            createdAt: new Date().getTime(),
            status: "open",
            type: type || "string",
          },
        },
      }
    );
  },
});

export const resolveProjectDataUpdate = new ValidatedMethod({
  name: "resolveProjectDataUpdate",
  validate: new SimpleSchema({
    projectId: {
      type: String,
      optional: false,
    },
    editId: {
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
  run({ projectId, editId, decision }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    let project = Projects.findOne({
      _id: projectId,
    });

    if (!isModerator(Meteor.userId()) && project.createdBy !== Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.projects.cant_merge");
    }

    if (!project) {
      throw new Meteor.Error("Error.", "messages.projects.no_project");
    }

    if (decision === "merge") {
      let edits = project.edits || [];
      let edit = {};

      edits.forEach(i => {
        if (i._id === editId) {
          edit = i;

          i.mergedAt = new Date().getTime();
          i.status = "merged";
        }
      });

      if (!edit) {
        throw new Meteor.Error("Error.", "messages.projects.edit");
      }

      return Projects.update(
        {
          _id: project._id,
        },
        {
          $set: {
            edits: edits,
            [edit.datapoint]: edit.newData,
          },
        }
      );
    } else {
      let edits = project.edits || [];

      edits.forEach(i => {
        if (i._id === editId) {
          i.rejectedAt = new Date().getTime();

          i.status = "rejected";
        }
      });

      return Projects.update(
        {
          _id: project._id,
        },
        {
          $set: {
            edits: edits,
          },
        }
      );
    }
  },
});

export const resolveProjectFlags = new ValidatedMethod({
  name: "resolveProjectFlags",
  validate: new SimpleSchema({
    projectId: {
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
  run({ projectId, decision }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error("Error.", "messages.moderator");
    }

    let project = Projects.findOne({
      _id: projectId,
    });

    if (!project) {
      throw new Meteor.Error("Error.", "messages.projects.no_project");
    }

    if (decision === "ignore") {
      return Projects.update(
        {
          _id: projectId,
        },
        {
          $set: {
            flags: [],
          },
        }
      );
    } else {
      return Projects.remove({
        _id: projectId,
      });
    }
  },
});

if (Meteor.isDevelopment) {
  Meteor.methods({
    generateTestChanges: () => {
      for (let i = 0; i < 2; i++) {
        Projects.insert({
          headline: `Testing 123`,
          description: "Test",
          createdBy: "test",
          createdAt: new Date().getTime(),
          edits: [
            {
              _id: "testId",
              proposedBy: "test",
              newData: "https://testing.com",
              datapoint: "github_url",
              status: "open",
              createdAt: new Date().getTime(),
              type: "link",
            },
          ],
        });
      }
    },
    removeTestChanges: () => {
      for (let i = 0; i < 2; i++) {
        Projects.remove({
          headline: `Testing 123`,
        });
      }
    },
    generateTestFlaggedProject: () => {
      for (let i = 0; i < 2; i++) {
        Projects.insert({
          headline: `Testing 123`,
          description: "Test",
          createdBy: "test",
          createdAt: new Date().getTime(),
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
