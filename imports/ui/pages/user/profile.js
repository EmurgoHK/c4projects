import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import '../../shared/projectCard/projectCard'
import './profile.html';
import './profile.scss';
import './editProfile.html';
import { notify } from '../../utils/notifier'
import { Projects } from "../../../api/projects/projects";
import { editProfile } from "../../../api/user/methods";

Template.userProfile.onCreated(function() {
  this.autorun(() => {
    this.subscribe("projects");
    this.subscribe("users");
  });
});

Template.userProfile.helpers({
  name : () => {
    let user = Meteor.users.findOne({ _id: FlowRouter.getParam("userId") });
    return user && user.name ? user.name : "No Name";
  },

  profile : () => {
    let user = Meteor.users.findOne({ _id: FlowRouter.getParam("userId") });
    if (user && user.userProfile) {
      return user.userProfile;
    }
  },

  moderator: () => {
    let user = Meteor.users.findOne({ _id: FlowRouter.getParam("userId") });

    return user && user.moderator ? true : false;
  },

  ownProfile : () => {
    return Meteor.userId() === FlowRouter.getParam("userId");
  },

  editProfile: () => {
    return `/profile/${Meteor.userId()}/edit`;
  },

  projects : () => {
    return Projects.find({ createdBy : FlowRouter.getParam("userId")})
  },

  getUserName : (str) => {
    return str.substring(str.indexOf(".com/") + 5)
  },

  simplifyWebAddress : (str) => {
    return str.substring(str.indexOf("://") + 3)
  }
});

// Edit User Profile
Template.editProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe("users");
  });
});

Template.editProfile.helpers({
  userProfile : () => {
    let user = Meteor.users.findOne({ _id: FlowRouter.getParam("userId") });
    if(user && user.userProfile) {
      return user.userProfile;
    }
    return '';
  },
});

Template.editProfile.events({
  'submit #editProfileForm' : (event, template) => {
    event.preventDefault();
    let data = {
      userId : Meteor.userId(),
      fullName : event.target.fullName.value,
      title : event.target.title.value,
      about : event.target.about.value,
      location : event.target.location.value,
      github : event.target.github.value,
      twitter : event.target.twitter.value,
      website : event.target.website.value
    };
    editProfile.call(data, (err, res) => {
      if(err) {
        notify(err.message, "error");
      } else {
        notify("Profile Updated", "success");
        FlowRouter.go(window.last || "/");
      }
    });
  },
});