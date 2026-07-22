/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const passwordField = users.fields.getByName("password");
    if (passwordField) {
      passwordField.min = 6;
      app.save(users);
    }

    let admin;
    try {
      admin = app.findAuthRecordByEmail("users", "admin@empresa.com");
    } catch (e) {
      admin = null;
    }

    if (!admin) {
      admin = new Record(users);
      admin.setEmail("admin@empresa.com");
      admin.setPassword("123456");
      admin.set("role", "admin");
      admin.set("verified", true);
      app.save(admin);
    }
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail("users", "admin@empresa.com");
      app.delete(admin);
    } catch (e) {
      if (e.message && e.message.includes("no rows in result set")) {
        console.log("Admin user already gone, skipping cleanup");
      } else {
        throw e;
      }
    }
  },
);
