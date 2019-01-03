import "../projectCard/projectCard";

import "./searchResults.html";
import "./searchResults.scss";

import { Projects } from "/imports/api/projects/projects";

Template.searchResults.onCreated(function() {
  this.sort = new ReactiveVar("date-desc"); // state of the sort by date
  this.titleSort = new ReactiveVar(""); // state of the sort by title

  this.results = new ReactiveVar({ count: () => 0 });
});

/**
 * Adds a new filter into a query object with $and
 * @param {*} obj Original query object
 * @param {*} newFilter Filter to add
 */
function addFilter(obj, newFilter) {
  if (obj.$and) {
    obj.$and.push(newFilter);
  } else if (Object.keys(obj).length > 0) {
    obj = {
      $and: [obj, newFilter],
    };
  } else {
    obj = newFilter;
  }
  return obj;
}

/**
 * Returns the query object that corresponds to the passed parameters
 * @param {String} contentType Type of the content to filter
 * @param {Regex} regex Regex to filter content
 * @param {String[]} languages Language codes to filter for - pass undefined to allow all
 * @param {*} data Data object with other extra params
 */
function getFilters(contentType, regex, languages, data) {
  let filter = {};
  if (regex) {
    // If we have a regex we filter for it in contentType dependant fields
    let orFilters = undefined;
    switch (contentType) {
      case "project":
        orFilters = [{ description: regex }, { headline: regex }, { tags: regex }];
        break;
      default:
        throw new Error("UnknownContentType" + contentType);
    }
    filter = addFilter(filter, { $or: orFilters });
  }
  if (languages) {
    // We filter for language if we have something to filter for
    const langFilter = { language: { $in: languages } };
    filter = addFilter(
      filter,
      languages.includes("en")
        ? { $or: [langFilter, { language: { $exists: false } }] } // This is necessary for compatibility with old content that don't have the language field set.
        : langFilter
    );
  }
  return filter;
}

Template.searchResults.onRendered(function() {
  this.autorun(() => {
    const data = Template.currentData();
    console.log(data.types, data.searchTerm);
    if (data.types.includes("projects")) {
      this.subscribe("projects.search", data.searchTerm);
    }
  });
  this.autorun(() => {
    const data = Template.currentData();

    const opts = {};

    // Limit number of results/type
    if (data.typeLimit) opts.limit = data.typeLimit;

    let res = [];
    const regex = data.searchTerm ? new RegExp(data.searchTerm.replace(/ /g, "|"), "ig") : undefined;

    if (data.types.includes("projects")) {
      res = res.concat(
        Projects.find(getFilters("project", regex, data.languages, data), opts).map(p => ({
          type: "project",
          res: p,
          date: p.createdAt,
          titleText: p.headline, // use the headline field of projects as title
        }))
      );
    }

    Template.instance().results.set(res);
  });
});

Template.searchResults.helpers({
  results: () => {
    const tpl = Template.instance();
    let results = tpl.results.get();

    if (tpl.titleSort.get()) {
      switch (
        tpl.titleSort.get() //sort by titles
      ) {
        case "title-asc":
          return results.sort((a, b) => {
            // check if the titleText is not undefined for a & b, if anyone is undefined we return 0
            return a.titleText && b.titleText ? a.titleText.localeCompare(b.titleText) : 0;
          });
        case "title-desc":
          return results.sort((a, b) => {
            // check if the titleText is not undefined for a & b, if anyone is undefined we return 0
            return b.titleText && a.titleText ? b.titleText.localeCompare(a.titleText) : 0;
          });
      }
    } else {
      // we only need to sort by date if the user has not selected sort by title
      switch (
        tpl.sort.get() //sort by date
      ) {
        case "date-asc":
          return results.sort((a, b) => a.date - b.date);
        case "date-desc":
        default:
          return results.sort((a, b) => b.date - a.date);
      }
    }
  },

  resultCount: () => Template.instance().results.get().length,

  isTypeOf: (res, type) => res.type === type,

  isDateAsc(val) {
    // we must check if the title sort is active. if the title sort is active we must not show asc or desc icons on date.
    if (Template.instance().titleSort.get() == "") return Template.instance().sort.get() === val;
  },

  isTitleAsc(val) {
    return Template.instance().titleSort.get() === val;
  },

  highlighter() {
    let searchVal = Template.currentData().searchTerm;
    return text => {
      return searchVal && text
        ? new Handlebars.SafeString(
            text.replace(
              RegExp("(" + searchVal.split(" ").join("|") + ")", "img"),
              '<span class="SearchMarker" >$1</span>'
            )
          )
        : text;
    };
  },
});

Template.searchResults.events({
  "click #sort-date": (event, templateInstance) => {
    event.preventDefault();

    // if the user clicks the date sort button we need to reset the sort by title
    templateInstance.titleSort.set("");

    if (templateInstance.sort.get() === "date-desc") {
      templateInstance.sort.set("date-asc");
    } else {
      templateInstance.sort.set("date-desc");
    }
  },

  "click #sort-title": (event, templateInstance) => {
    event.preventDefault();

    if (templateInstance.titleSort.get() === "") {
      templateInstance.titleSort.set("title-asc");
    } else if (templateInstance.titleSort.get() === "title-asc") {
      templateInstance.titleSort.set("title-desc");
    } else {
      templateInstance.titleSort.set("");
    }
  },

  "click #add-new": (event, templateInstance) => {
    event.preventDefault();

    Template.currentData().addNewCallback();
  },
});
