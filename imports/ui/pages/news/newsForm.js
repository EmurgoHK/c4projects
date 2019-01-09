import "./newsForm.html";
import "./newsForm.scss";

import { News } from "../../../api/news/news";
import { editNews, addNews } from "../../../api/news/methods";
import { Projects } from "../../../api/projects/projects";
import { notify } from "../../utils/notifier";

function maxCharValue(inputId) {
  if (inputId === "headline") {
    return 90;
  }
}

Template.newsForm.onCreated(function() {
  this.news = new ReactiveVar();
  this.project = new ReactiveVar();

  this.autorun(() => {
    if (FlowRouter.current().route.name.startsWith("edit")) {
      this.subscribe("news.itemWithProject", FlowRouter.getParam("slug"));
    } else {
      this.subscribe("projects.item", FlowRouter.getParam("projectSlug"));
    }
  });

  this.autorun(() => {
    if (FlowRouter.current().route.name.startsWith("edit")) {
      const slug = FlowRouter.getParam("slug");
      const news = News.findOne({
        $or: [{ _id: slug }, { slug }],
      });

      if (news) {
        this.subscribe("news.item", news._id);
      }

      Template.instance().news.set(news);
    }

    this.project.set(Projects.findOne({ slug: FlowRouter.getParam("projectSlug") }));
  });
});

Template.newsForm.helpers({
  isNew: () => FlowRouter.current().route.name.startsWith("new"),
  isEdit: () => FlowRouter.current().route.name.startsWith("edit"),

  news: () => Template.instance().news.get(),

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

Template.newsForm.events({
  "keyup .form-control"(event, _tpl) {
    event.preventDefault();

    let inputId = event.target.id;
    let inputValue = event.target.value;
    let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length);
    let charsLeftText = `${inputMaxChars} ${TAPi18n.__("news.form.chars_left")}`;

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
  "click .add-news"(event, _tpl) {
    event.preventDefault();

    var captchaData = grecaptcha.getResponse();

    const news = Template.instance().news.get();
    if (FlowRouter.current().route.name === "editNews") {
      editNews.call(
        {
          newsId: news._id,
          headline: $("#headline").val(),
          description: $("#description").val(),
          readMoreURL: $("#readMoreURL").val() || "",
          type: news.type,
          captcha: captchaData,
        },
        (err, _data) => {
          if (!err) {
            notify(TAPi18n.__("projects.form.success_edit"), "success");
            FlowRouter.go(`/news/${News.findOne(news._id).slug}`);
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
    const project = Template.instance().project.get();
    addNews.call(
      {
        newsId: FlowRouter.getParam("id"),
        headline: $("#headline").val(),
        description: $("#description").val(),
        readMoreURL: $("#readMoreURL").val() || "",
        projectId: project._id,
        type: "user_news",
        captcha: captchaData,
      },
      (err, data) => {
        if (!err) {
          notify(TAPi18n.__("projects.form.success_add"), "success");
          FlowRouter.go(`/projects/${project.slug}`);
          return;
        }
        console.log(err);

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
