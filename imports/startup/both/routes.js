import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";
import { Session } from "meteor/session";
import { Accounts } from "meteor/accounts-base";

import { notify } from "../../ui/utils/notifier";
import { Projects } from "../../api/projects/projects";
import { News } from "../../api/news/news";

const userLoginFilter = (context, redirect, _stop) => {
  let oldRoute = "/";
  let authRoutes = ["/login", "/signup"];

  if (context.oldRoute !== undefined) {
    oldRoute = context.oldRoute.path;
  }

  // restrict access to auth pages when user is signed in
  if (Meteor.userId() && authRoutes.some(a => context.path.startsWith(a))) {
    redirect(oldRoute);
  }

  if (!Meteor.userId() && !authRoutes.some(a => context.path.startsWith(a))) {
    if (notify) notify("Login to continue!", "error");
    redirect("/login?from=" + context.path);
  }
};

// Redirect to login
Accounts.onLogout(user => {
  FlowRouter.go("/login");
});

// FlowRouter.triggers.enter([userLoginFilter], { except: ['home', 'projects'] })
FlowRouter.triggers.enter([
  function(options) {
    if (options.route.options && options.route.options.breadcrumb) {
      let breadcrumb = options.route.options.breadcrumb(options.params) || {};
      breadcrumb.urls = breadcrumb.urls || [];
      Session.set("breadcrumbs", breadcrumb);
    } else {
      Session.set("breadcrumbs", {});
    }
  },
]);

// Set up all routes in the app
FlowRouter.route("/", {
  name: "home",
  breadcrumb: params => {
    return {
      text: "",
      urls: ["/"],
    };
  },
  subscriptions: function(params, queryParams) {},
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "home",
    });
  },
});

// Set up all routes in the app
FlowRouter.route("/login", {
  name: "login",
  breadcrumb: params => {
    return {
      text: "",
      urls: ["/"],
    };
  },
  triggersEnter: [userLoginFilter],
  subscriptions: function(params, queryParams) {},
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      main: "login",
    });
  },
});

// Set up all routes in the app
FlowRouter.route("/signup", {
  name: "signup",
  breadcrumb: params => {
    return {
      text: "",
      urls: ["/"],
    };
  },
  triggersEnter: [userLoginFilter],
  subscriptions: function(params, queryParams) {},
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "signup",
    });
  },
});

// Set up all routes in the app

FlowRouter.route("/profile/:userId", {
  name: "profile",
  breadcrumb: params => {
    return {
      text: "Profile",
      urls: ["/profile"],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      main: "userProfile",
    });
  },
});

FlowRouter.route("/profile/:userId/edit", {
  name: "editProfile",
  breadcrumb: params => {
    return {
      text: "Edit Profile",
      urls: ["/profile/edit"],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      main: "editProfile",
    });
  },
});

FlowRouter.route("/projects", {
  name: "projects",
  breadcrumb: params => {
    return {
      text: "projects",
      urls: ["/projects"],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      main: "projects",
    });
  },
});

FlowRouter.route("/projects/new", {
  name: "addProject",
  breadcrumb: params => {
    return {
      text: "projects_new",
      urls: ["/projects"],
    };
  },
  triggersEnter: [userLoginFilter],
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "projectForm",
    });
  },
});

FlowRouter.route("/projects/:slug", {
  name: "viewProject",
  breadcrumb: params => {
    let project = Projects.findOne({
      slug: params.slug,
    });

    return {
      text: "projects_view",
      name: project ? project.headline : "View",
      urls: ["/projects"],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "viewProject",
    });
  },
});

FlowRouter.route("/projects/:projectSlug/addNews", {
  name: "addNews",
  breadcrumb: params => {
    let project = Projects.findOne({
      slug: params.projectSlug,
    });

    return {
      text: "news_new",
      name: project ? project.headline : "View",
      urls: ["/projects", "/projects/" + params.projectSlug],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "newsForm",
    });
  },
});

FlowRouter.route("/news/:slug/edit", {
  name: "editNews",
  breadcrumb: params => {
    let news = News.findOne({
      slug: params.slug,
    });

    return {
      text: "news_view",
      name: news ? news.headline : "View",
      urls: ["/news/" + params.slug],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "newsForm",
    });
  },
});

FlowRouter.route("/news/:slug", {
  name: "viewNews",
  breadcrumb: params => {
    let news = News.findOne({
      slug: params.slug,
    });

    return {
      text: "news_view",
      name: news ? news.headline : "View",
      urls: ["/"],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      footer: "footer",
      main: "viewNews",
    });
  },
});

FlowRouter.route("/notifications", {
  name: "notifications",
  breadcrumb: params => {
    return {
      text: "notifications",
      urls: ["/notifications"],
    };
  },
  action: () => {
    BlazeLayout.render("main", {
      header: "header",
      sidebar: "sidebar",
      main: "notifications",
    });
  },
});
