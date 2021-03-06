import "./sidebar.html";

import { FlowRouter } from "meteor/kadira:flow-router";

Template.sidebar.helpers({
  activeClass: function(name) {
    FlowRouter.watchPathChange();
    return FlowRouter.current().route.name === name ? "active" : "";
  },
  // languages: () => {
  //   return Object.keys(TAPi18n.languages_names).map(key => {
  //     return {
  //       code: key,
  //       name: TAPi18n.languages_names[key][1],
  //       selected: key === TAPi18n.getLanguage()
  //     };
  //   });
  // }
});

Template.sidebar.events({
  "click .sidebar-minimizer": function() {
    $("body").toggleClass("sidebar-minimized");
  },
  "click .nav-item": function() {
    //only close the side bar when the screen size is less that 400pixel e.g. mobile devices
    if ($(window).width() < 400) {
      $("body").removeClass("sidebar-lg-show");
    }
  },
  "click .nav-dropdown-toggle"(event, template) {
    event.preventDefault();
    $(event.currentTarget)
      .closest(".nav-dropdown")
      .toggleClass("open");
  },
  // "change #selectLanguage"(event) {
  //   event.preventDefault();
  //   TAPi18n.setLanguage(event.target.value);
  // }
});
