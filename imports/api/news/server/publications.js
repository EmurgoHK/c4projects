import { Meteor } from "meteor/meteor";
import { News } from "../news";
import { Projects } from "../../projects/projects";

Meteor.publish("news", () =>
  News.find(
    {},
    {
      sort: {
        createdAt: -1,
      },
    }
  )
);

Meteor.publish("news.search", q =>
  News.find(
    {
      $or: [
        {
          headline: {
            $regex: new RegExp(q || ".*", "i"),
          },
        },
        {
          description: {
            $regex: new RegExp(q || ".*", "i"),
          },
        },
        {
          projectId: q,
        },
      ],
    },
    {
      sort: {
        createdAt: -1,
      },
    }
  )
);

Meteor.publish("news.item", id => {
  return News.find(
    {
      $or: [
        {
          _id: id,
        },
        {
          slug: id,
        },
      ],
    },
    {
      sort: {
        createdAt: -1,
      },
    }
  );
});

Meteor.publish("news.itemWithProject", id => {
  const news = News.find(
    {
      $or: [
        {
          _id: id,
        },
        {
          slug: id,
        },
      ],
    },
    {
      sort: {
        createdAt: -1,
      },
    }
  );
  return [news, ...news.map(n => (n.projectId ? Projects.find({ _id: n.projectId }) : undefined))];
});
