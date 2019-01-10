import "./viewNews.html";
import "./viewNews.scss";

import "../../shared/commentArea/commentArea";

import { News } from "../../../api/news/news";
import { Projects } from "../../../api/projects/projects";

Template.viewNews.onCreated(function() {
  this.news = new ReactiveVar();

  this.autorun(() => {
    this.subscribe("news.itemWithProject", FlowRouter.getParam("slug"));
  });

  this.autorun(() => {
    const slug = FlowRouter.getParam("slug");

    const news = News.findOne({
      $or: [{ _id: slug }, { slug }],
    });

    Template.instance().news.set(news);
  });
});

Template.viewNews.helpers({
  news: () => Template.instance().news.get(),
  author: () => {
    const news = Template.instance().news.get();
    return news && Meteor.users.findOne({ _id: news.createdBy });
  },
  isOwner: function() {
    const news = Template.instance().news.get();
    if (news && news.createdBy === Meteor.userId()) {
      return true;
    }
    return false;
  },
  project: () => {
    const news = Template.instance().news.get();
    return news && Projects.findOne({ _id: news.projectId });
  },
  commentSuccess: () => {
    return () => {
      notify(TAPi18n.__("news.view.success"), "success");
    };
  },
});
