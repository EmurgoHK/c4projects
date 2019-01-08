import "./projectForm.html";
import "./projects.scss";

import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";

import { Projects } from "../../../api/projects/projects";
import { notify } from "../../utils/notifier";

import { addProject, editProject, resolveProjectDataUpdate } from "/imports/api/projects/methods";

const maxCharValue = inputId => {
  if (inputId === "headline") {
    return 90;
  }
};

Template.projectForm.onCreated(function() {
  this.project = new ReactiveVar();
  this.autorun(() => {
    if (FlowRouter.current().route.name.startsWith("edit") || FlowRouter.current().route.name.startsWith("translate")) {
      this.subscribe("projects.item", FlowRouter.getParam("id"));
      this.subscribe("translationGroups.item", FlowRouter.getParam("id"));
    }
  });
});

Template.projectForm.onRendered(function() {
  this.autorun(() => {
    let project = Projects.findOne({
      _id: FlowRouter.getParam("id"),
    });
    this.project.set(project);
  });
});

Template.projectForm.helpers({
  isNew: () => FlowRouter.current().route.name.startsWith("new"),
  isEdit: () => FlowRouter.current().route.name.startsWith("edit"),

  project: () => Template.instance().project.get(),
  languages: () => {
    return Object.keys(TAPi18n.languages_names).map(key => {
      return {
        code: key,
        name: TAPi18n.languages_names[key][1],
        selected: key === TAPi18n.getLanguage(),
      };
    });
  },
});

Template.projectForm.events({
  "keyup .form-control"(event, _tpl) {
    event.preventDefault();

    let inputId = event.target.id;
    let inputValue = event.target.value;
    let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length);
    let charsLeftText = `${inputMaxChars} ${TAPi18n.__("projects.form.chars_left")}`;

    $(`#${inputId}-chars`).text(charsLeftText);

    let specialCodes = [8, 46, 37, 39]; // backspace, delete, left, right

    if (inputMaxChars <= 0) {
      $(`#${inputId}`).keypress(e => {
        return !!~specialCodes.indexOf(e.keyCode);
      });
      return true;
    }
    // Remove validation error, if exists
    $(`#${inputId}`).removeClass("is-invalid");
    $(`#${inputId}`).unbind("keypress");
  },
  "click .add-project"(event, _tpl) {
    event.preventDefault();

    var captchaData = grecaptcha.getResponse();

    if (FlowRouter.current().route.name === "editProject") {
      editProject.call(
        {
          projectId: FlowRouter.getParam("id"),
          headline: $("#headline").val(),
          description: $("#description").val(),
          github_url: $("#github_url").val() || "",
          website: $("#website").val() || "",
          captcha: captchaData,
          type: $('input[name="type"]:checked').val(),
        },
        (err, _data) => {
          if (!err) {
            notify(TAPi18n.__("projects.form.success_edit"), "success");
            FlowRouter.go("/projects");
            return;
          }

          if (err.details && err.details.length >= 1) {
            err.details.forEach(e => {
              $(`#${e.name}`).addClass("is-invalid");
              $(`#${e.name}Error`).show();
              $(`#${e.name}Error`).text(TAPi18n.__(e.message));
            });
          }
        }
      );

      return;
    }

    addProject.call(
      {
        headline: $("#headline").val(),
        description: $("#description").val(),
        github_url: $("#github_url").val() || "",
        website: $("#website").val() || "",
        captcha: captchaData,
        type: $('input[name="type"]:checked').val(),
        language: $("#language").val(),
      },
      (err, data) => {
        if (!err) {
          notify(TAPi18n.__("projects.form.success_add"), "success");
          FlowRouter.go("/projects");
          return;
        }

        if (err.details === undefined && err.reason) {
          notify(TAPi18n.__(err.reason), "error");
          return;
        }

        if (err.details && err.details.length >= 1) {
          err.details.forEach(e => {
            $(`#${e.name}`).addClass("is-invalid");
            $(`#${e.name}Error`).show();
            $(`#${e.name}Error`).text(TAPi18n.__(e.message));
          });
        }
      }
    );
  },
});
