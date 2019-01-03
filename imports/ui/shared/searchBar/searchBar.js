import "./searchBar.html";
import "./searchBar.scss";

Template.searchBar.onCreated(function() {
  this.searchTerm = new ReactiveVar(undefined);
  this.autorun(() => {
    this.searchTerm.set(Template.currentData().searchTerm);
  });
});

Template.searchBar.helpers({
  placeholder: () => Template.currentData().placeholder,
  searchTerm: () => Template.instance().searchTerm.get(),
});

Template.searchBar.events({
  "keyup/change #searchBox": (event, templateInstance) => {
    let searchText = templateInstance
      .$("#searchBox")
      .val()
      .trim();

    // Save it internally to update links
    templateInstance.searchTerm.set(searchText);

    // Communicate change up
    templateInstance.data.onChange(searchText);
  },
  "click .search-bar-cross": (event, templateInstance) => {
    // Initially clear search bar.
    $("#searchBox").val("");
    // Trigger change event so process further processes
    $("#searchBox").trigger("keyup");
  },
});
