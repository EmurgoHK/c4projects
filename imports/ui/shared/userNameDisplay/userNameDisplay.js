import "./userNameDisplay.html";

Template.userNameDisplay.helpers({
  // Return data.profile.name defaulting to 'No name' if undefined
  name: () => {
    let user = Meteor.users.findOne({_id : Template.currentData()})

    return user && user.name ? user.name : 'No Name'
  },

  profile: () => {
    return `/profile/${Template.currentData()}/`
  },

  moderator: () => {
    let user = Meteor.users.findOne({_id : Template.currentData()})

    return user && user.moderator ? true : false
  }
});
