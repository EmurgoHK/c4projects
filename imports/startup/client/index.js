// import libs
import "bootstrap";

// import main templates
import "../../ui/layout/main/main";
import "../../ui/layout/header/header";
import "../../ui/layout/sidebar/sidebar";
import "../../ui/layout/footer/footer";

// import pages
import "../../ui/pages/home/home";
import "../../ui/pages/login/login";
import "../../ui/pages/signup/signup";

import "../../ui/pages/projects/projectForm";
import "../../ui/pages/projects/projects";
import "../../ui/pages/projects/viewProject";

import "../../ui/pages/user/profile";

import "../../ui/pages/news/newsForm";
import "../../ui/pages/news/viewNews";

import "../../ui/pages/notifications/notifications";

import "../../ui/utils/handlebars-helpers";

Meteor.startup(() => {
  reCAPTCHA.config({
    publickey: Meteor.settings.public.RECAPTCHA_CLIENT,
  });

  const userLang = Meteor.user() && Meteor.user().language;
  TAPi18n.setLanguage(sessionStorage.getItem("uiLanguage") || userLang || "en").fail(function(error_message) {
    // Handle the situation
    console.error(error_message);
  });
});
