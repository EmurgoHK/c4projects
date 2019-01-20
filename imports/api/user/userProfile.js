import SimpleSchema from "simpl-schema";

export const userProfileSchema = new SimpleSchema({
  fullName : {
    type : String,
    optional : true,
  },
  title : {
    type : String,
    optional : true,
  },
  about : {
    type : String,
    optional : true,
  },
  location : {
    type : String,
    optional : true,
  },
  github : {
    type : String,
    optional : true,
  },
  twitter : {
    type : String,
    optional : true,
  },
  website : {
    type : String,
    optional : true,
  }
})