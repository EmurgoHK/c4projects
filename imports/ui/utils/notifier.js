import Noty from "noty";

if (Meteor.isClient) {
  Noty.overrideDefaults({
    layout: "topRight",
    type: "success",
    theme: "sunset",
    closeWith: ["click", "button"],
    timeout: 2000,
    progressBar: false,
  });
}

// Notifier API
export const notify = (message, type) => {
  if (Meteor.isClient) {
    return new Noty({
      type: type || "info",
      text: message,
    }).show();
  }
};
