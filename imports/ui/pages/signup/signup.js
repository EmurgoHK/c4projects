import { FlowRouter } from "meteor/kadira:flow-router";

import { notify } from "../../utils/notifier";

import "./signup.html";

Template.signup.events({
  "click #goToLogin"(event) {
    event.preventDefault();
    FlowRouter.go("/login");
  },

  submit(event) {
    event.preventDefault();
    let target = event.target;
    let userProfile = {
      fullName: target.name.value
    }
    if (target.email.value !== "" && target.password.value !== "") {
      if (target.confirmPassword.value === target.password.value) {
        Accounts.createUser(
          {
            email: target.email.value,
            password: target.password.value,
            name: target.name.value,
            language: "en",
            userProfile : userProfile
          },
          err => {
            if (err) {
              notify(TAPi18n.__(err.message), "error");
              return;
            }
            FlowRouter.go(window.last || "/");
            return;
          }
        );
        return;
      }
      notify(TAPi18n.__("signup.confirm_error"), "error");
      return;
    }
    notify(TAPi18n.__("signup.required"), "error");
  },
});
