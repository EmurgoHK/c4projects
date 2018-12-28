import SimpleSchema from "simpl-schema";

Meteor.users.attachSchema(
  new SimpleSchema({
    name: {
      type: String,
      label: "Name",
      max: 200,
    },
    language: {
      type: String,
      label: "Language",
      defaultValue: "en",
      max: 3,
    },
    moderator: {
      type: Boolean,
      label: "Moderator",
      defaultValue: false,
    },
  })
);

Accounts.onCreateUser((options, user) => {
  const customUser = Object.assign({}, { name: options.name, language: options.language, moderator: false }, user);

  // Send Verification Email on Sign UP
  Meteor.setTimeout(function() {
    Accounts.sendVerificationEmail(customUser._id);
  }, 2000);

  return customUser;
});

// Custom Verify Email Template
Accounts.emailTemplates.verifyEmail = {
  from() {
    return "C4 Projects <no-reply@cardanoupdate.space";
  },
  subject() {
    return "Activate your account on C4 Projects.";
  },
  text(user, url) {
    return `Hey ${user.name || "User"}! \n\n Verify your e-mail on C4 Projects by clicking this link: ${url}`;
  },
};
