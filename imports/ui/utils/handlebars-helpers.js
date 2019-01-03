import { Template } from "meteor/templating";

import { isModerator } from "../../api/user/methods";

import marked from "marked";
import moment from "moment-timezone";

subsCache = new SubsCache(5, 10);
Template.registerHelper("SubsCacheReady", () => {
  return Object.keys(subsCache.cache)
    .map(x => subsCache.cache[x].ready())
    .every(x => x);
});

Template.registerHelper("isModerator", () => isModerator(Meteor.userId()));
Template.registerHelper("LimitChars", val => (val && val.length > 100 ? val.slice(0, 100) + " ... " : val));

Template.registerHelper("md", content => {
  return (this.innerHTML = marked(content || "", { sanitize: true }));
});

Template.registerHelper("showTimeAgoTimestamp", (date, timezone) => {
  if (!date) {
    return "";
  }

  if (timezone && typeof timezone === "string") {
    return moment
      .tz(date, "UTC")
      .tz(timezone)
      .fromNow();
  }

  return moment(date).fromNow();
});

Template.registerHelper("showLocalTimestamp", (date, timezone) => {
  if (!date) {
    return "";
  }

  if (timezone && typeof timezone === "string") {
    return moment
      .tz(date, "UTC")
      .tz(timezone)
      .format("LLL z");
  }

  return moment(date).format("LLL");
});
