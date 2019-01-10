import "./subscriptionButton.html";
import "./subscriptionButton.scss";
import { Subscriptions } from "../../../api/subscriptions/subscriptions";

Template.subscriptionButton.onCreated(function() {
  this.subscribe('subscriptions.my');
})

Template.subscriptionButton.helpers({
  isSubscribed: () => !!Subscriptions.findOne({_id: Template.currentData().articleId}),
})

Template.subscriptionButton.events({
  'click .btn.subscribe': (ev, tplInstance) => Meteor.call('subscribe', {articleId: Template.currentData().articleId}),
  'click .btn.unsubscribe': (ev, tplInstance) => Meteor.call('unsubscribe', {articleId: Template.currentData().articleId}),
})