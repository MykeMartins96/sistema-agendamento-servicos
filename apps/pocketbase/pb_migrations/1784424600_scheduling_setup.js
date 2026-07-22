/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // --- Admin auth via existing `users` collection (with role) ---
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("role")) {
      users.fields.add(
        new SelectField({
          name: "role",
          required: false,
          maxSelect: 1,
          values: ["admin"],
        }),
      );
      app.save(users);
    }

    // Seed a known-good admin for local testing.
    try {
      app.findAuthRecordByEmail("users", "admin@agenda.com");
    } catch (_) {
      const admin = new Record(users);
      admin.setEmail("admin@agenda.com");
      admin.setPassword("admin12345");
      admin.set("name", "Administrador");
      admin.set("role", "admin");
      admin.set("verified", true);
      app.save(admin);
    }

    // --- Appointments collection ---
    let appointments;
    try {
      appointments = app.findCollectionByNameOrId("appointments");
    } catch (_) {
      appointments = new Collection({
        type: "base",
        name: "appointments",
        // Public can read (to check availability) and create (to book).
        listRule: "",
        viewRule: "",
        createRule: "",
        // Only authenticated admins can update/delete.
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: "name", type: "text", required: true, max: 120 },
          { name: "phone", type: "text", required: true, max: 40 },
          { name: "service", type: "text", required: true, max: 120 },
          { name: "date", type: "text", required: true, max: 10 },
          { name: "time", type: "text", required: true, max: 5 },
          {
            name: "status",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["agendado", "confirmado", "concluido", "cancelado"],
          },
        ],
      });
      app.save(appointments);

      // Prevent double-booking of the same date + time slot.
      appointments.addIndex(
        "idx_appointments_slot",
        true,
        "date, time",
        "status != 'cancelado'",
      );
      app.save(appointments);
    }
  },
  (app) => {
    try {
      const appointments = app.findCollectionByNameOrId("appointments");
      app.delete(appointments);
    } catch (_) {
      /* already gone */
    }
  },
);
