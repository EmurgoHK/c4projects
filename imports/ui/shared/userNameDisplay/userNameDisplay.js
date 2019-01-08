import "./userNameDisplay.html";

Template.userNameDisplay.helpers({
  // Return data.name defaulting to 'No name' if undefined
  name: () => (Template.currentData() || {}).name || TAPi18n.__("shared.user.no_name"),
});
