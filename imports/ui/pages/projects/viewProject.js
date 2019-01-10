import "../../shared/loader/loader";
import "../../shared/userNameDisplay/userNameDisplay";
import "../../shared/subscriptionButton/subscriptionButton";

import "./viewProject.html";

import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";

import { Projects } from "../../../api/projects/projects";

import { flagProject, proposeNewData } from "../../../api/projects/methods";

import { notify } from "../../utils/notifier";

import { loggedInSWAL } from "../../utils/loggedInSWAL";

Template.viewProject.onCreated(function() {
  this.project = new ReactiveVar();

  this.autorun(() => {
    this.subscribe("projects.item", FlowRouter.getParam("slug"));
    this.subscribe("users");
  });

  this.autorun(() => {
    const project = Projects.findOne({
      slug: FlowRouter.getParam("slug"),
    });
    this.project.set(project);
  });
});

Template.viewProject.helpers({
  isOwner: function() {
    const project = Template.instance().project.get();
    if (project && project.createdBy === Meteor.userId()) {
      return true;
    }
    return false;
  },
  project: () => Template.instance().project.get(),
  author: () => Meteor.users.findOne({ _id: Template.currentData().createdBy }),
  coolCount: function() {
    return Comments.find({
      newsId: this._id,
      type: "coolstuff",
    }).count();
  },
  flagCount: function() {
    return Comments.find({
      newsId: this._id,
      type: "redflag",
    }).count();
  },
  tagName: tag => tag.name,
  tagUrl: tag => `/tags?search=${encodeURIComponent(tag.name)}`,
  commentSuccess: () => {
    return () => {
      notify(TAPi18n.__("projects.view.success"), "success");
    };
  },
  newsArgs: () => {
    const project = Template.instance().project.get();

    return {
      types: project ? ["news"] : [], // This is to make sure we don't load/render all news if the project is not yet loaded.
      searchTerm: project && project._id,
      doLanguageGrouping: true,
      languages: Meteor.user() && Meteor.user().profile && Meteor.user().profile.contentLanguages,
    };
  },
});

Template.viewProject.events({
  "click .flag-project": (event, templateInstance) => {
    let project =
      Projects.findOne({
        slug: FlowRouter.getParam("slug"),
      }) || {};

    flagDialog.call(project, flagProject, "projectId");
  },
  "click .github": function(event, temlateInstance) {
    if ($(event.currentTarget).attr("href")) {
      return;
    }

    loggedInSWAL({
      action: "shared.loginModal.action.suggest",
      text: TAPi18n.__("projects.view.no_gh"),
      type: "warning",
      showCancelButton: true,
      input: "text",
    }).then(val => {
      if (val.value) {
        proposeNewData.call(
          {
            projectId: this._id,
            datapoint: "github_url",
            newData: val.value,
            type: "link",
          },
          (err, data) => {
            if (err) {
              notify(TAPi18n.__(err.reason || err.message), "error");
            } else {
              notify(TAPi18n.__("projects.view.success_contrib"), "success");
            }
          }
        );
      }
    });
  },
  "click .website": function(event, temlateInstance) {
    if ($(event.currentTarget).attr("href")) {
      return;
    }

    loggedInSWAL({
      action: "shared.loginModal.action.suggest",
      text: TAPi18n.__("projects.view.no_web"),
      type: "warning",
      showCancelButton: true,
      input: "text",
    }).then(val => {
      if (val.value) {
        proposeNewData.call(
          {
            projectId: this._id,
            datapoint: "website",
            newData: val.value,
            type: "link",
          },
          (err, data) => {
            if (err) {
              notify(TAPi18n.__(err.reason || err.message), "error");
            } else {
              notify(TAPi18n.__("projects.view.success_contrib"), "success");
            }
          }
        );
      }
    });
  },
  "click .projectWarning"(event, _tpl) {
    event.preventDefault();
    loggedInSWAL({
      action: "shared.loginModal.action.suggest",
      title: TAPi18n.__("projects.view.missing_repo"),
      text: TAPi18n.__("projects.view.missing_info"),
      type: "warning",
      cancelButtonColor: "#d33",
      confirmButtonText: TAPi18n.__("projects.view.ok"),
    });
  },
});
