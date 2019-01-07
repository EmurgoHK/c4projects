import "./newsCard.html";
import "./newsCard.scss";

import { Template } from "meteor/templating";

import { notify } from "../../utils/notifier";

import { loggedInSWAL } from "../../utils/loggedInSWAL";
import { deleteNews } from "../../../api/news/methods";

Template.newsCard.helpers({
  editURL() {
    const news = Template.currentData().news;
    if (news.createdBy === Meteor.userId()) {
      return `/news/${news._id}/edit`;
    }
    return false;
  },
  limitChars(val) {
    const limitedText = val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
    const transformer = Template.currentData().textTransformer;
    if (transformer) return transformer(limitedText);
    return limitedText;
  },
  transform(text) {
    const transformer = Template.currentData().textTransformer;
    return transformer ? transformer(text) : text;
  },
});

Template.newsCard.events({
  "click #js-remove": (event, templateInstance) => {
    event.preventDefault();
    const news = Template.currentData().news;
    loggedInSWAL({
      action: "shared.loginModal.action.delete",
      text: TAPi18n.__("news.card.are_you_sure"),
      type: "warning",
      showCancelButton: true,
    }).then(confirmed => {
      if (confirmed.value) {
        deleteNews.call(
          {
            newsId: news._id,
          },
          (err, data) => {
            if (err) {
              notify(TAPi18n.__(err.reason || err.message), "error");
            }
          }
        );
      }
    });
  },
  "click .flag-project": function(event, templateInstance) {
    event.preventDefault();

    // flagDialog.call(Template.currentData().project, flagProject, "projectId");
  },
});
