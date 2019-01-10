import "./home.html";
import "./home.scss";
import "../../shared/searchBar/searchBar";
import "../../shared/searchResults/searchResults";

Template.home.onCreated(function() {
  this.searchFilter = new ReactiveVar(undefined);
});

Template.home.helpers({
  searchArgs: () => {
    const instance = Template.instance();
    return {
      placeholder: "Search projects",
      type: "projects",
      onChange: newTerm => instance.searchFilter.set(newTerm),
    };
  },

  resultArgs: () => {
    return {
      types: ["projects"],
      searchTerm: Template.instance().searchFilter.get(),
      doLanguageGrouping: true,
      languages: Meteor.user() && Meteor.user().profile && Meteor.user().profile.contentLanguages,
    };
  },
});
