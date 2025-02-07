<<<<<<< HEAD
import dotenv from "dotenv";
dotenv.config();

=======
<<<<<<< HEAD
>>>>>>> 0411766e95ea0b18fec191668c5bb7b2d696a155
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
import * as schema from "../drizzle/schema";

const dirname: string = path.dirname(fileURLToPath(import.meta.url));

const queryClient = postgres({
	host: process.env.API_POSTGRES_HOST,
	port: Number(process.env.API_POSTGRES_PORT),
	database: process.env.API_POSTGRES_DATABASE,
	username: process.env.API_POSTGRES_USER,
	password: process.env.API_POSTGRES_PASSWORD,
	ssl: process.env.API_POSTGRES_SSL_MODE === "true",
});

const db = drizzle(queryClient, { schema });

interface LoadOptions {
	items?: string[];
	format?: boolean;
=======
import fs from "fs/promises";
import path from "path";
import yargs from "yargs";
import { connect } from "../db";
import {
  ActionItemCategory,
  AgendaCategoryModel,
  AppUserProfile,
  Community,
  Event,
  Organization,
  Post,
  User,
} from "../models";
import { RecurrenceRule } from "../models/RecurrenceRule";

interface InterfaceArgs {
  items?: string;
  format?: boolean;
  _: unknown;
>>>>>>> b63233d576aed93b17026ccf16e84ff13f5481ab
}

/**
 * Lists sample data files and their document counts in the sample_data directory.
 */
<<<<<<< HEAD
export async function listSampleData(): Promise<void> {
	try {
		const sampleDataPath = path.resolve(dirname, "../../sample_data");
		const files = await fs.readdir(sampleDataPath);

		console.log("Sample Data Files:\n");

		console.log(
			`${"| File Name".padEnd(30)}| Document Count |
${"|".padEnd(30, "-")}|----------------|
`,
		);

		for (const file of files) {
			const filePath = path.resolve(sampleDataPath, file);
			const stats = await fs.stat(filePath);
			if (stats.isFile()) {
				const data = await fs.readFile(filePath, "utf8");
				const docs = JSON.parse(data);
				console.log(
					`| ${file.padEnd(28)}| ${docs.length.toString().padEnd(15)}|`,
				);
			}
		}
		console.log();
	} catch (err) {
		console.error("\x1b[31m", `Error listing sample data: ${err}`);
	}
}

/**
 * Clears all tables in the database.
 */
async function formatDatabase(): Promise<void> {
	const tables = [
		schema.usersTable,
		schema.postsTable,
		schema.organizationsTable,
		schema.eventsTable,
	];

	for (const table of tables) {
		await db.delete(table);
	}
	console.log("Cleared all tables\n");
}

/**
 * Inserts data into specified tables.
 * @param collections - Array of collection/table names to insert data into
 * @param options - Options for loading data
 */
async function insertCollections(
	collections: string[],
	options: LoadOptions = {},
): Promise<void> {
	try {
		if (options.format) {
			await formatDatabase();
		}

		const userIds: string[] = [];
		const organizationIds: string[] = [];

		for (const collection of collections) {
			const data = await fs.readFile(
				path.resolve(dirname, `../../sample_data/${collection}.json`),
				"utf8",
			);

			switch (collection) {
				case "users": {
					const users = JSON.parse(data).map(
						(user: {
							createdAt: string | number | Date;
							updatedAt: string | number | Date;
						}) => {
							const id = uuidv4();
							userIds.push(id);
							return {
								...user,
								id,
								emailAddress: `${uuidv4()}@example.com`, // Ensure unique email address
								createdAt: user.createdAt
									? new Date(user.createdAt)
									: new Date(),
								updatedAt: user.updatedAt
									? new Date(user.updatedAt)
									: new Date(),
							};
						},
					) as (typeof schema.usersTable.$inferInsert)[];
					await db.insert(schema.usersTable).values(users);
					break;
				}
				case "organizations": {
					type OrgType = {
						name: string;
						createdAt: string | number | Date;
						updatedAt: string | number | Date;
					};
					const organizations = JSON.parse(data).map((org: OrgType) => {
						const id = uuidv4();
						organizationIds.push(id);
						return {
							...org,
							id, // Convert to valid UUID
							name: `${org.name}-${uuidv4()}`, // Ensure unique organization name
							createdAt: org.createdAt ? new Date(org.createdAt) : new Date(),
							updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date(),
							creatorId: userIds[Math.floor(Math.random() * userIds.length)], // Use valid user ID
							updaterId: userIds[Math.floor(Math.random() * userIds.length)], // Use valid user ID
						};
					}) as (typeof schema.organizationsTable.$inferInsert)[];
					await db.insert(schema.organizationsTable).values(organizations);
					break;
				}
				case "posts": {
					if (userIds.length === 0 || organizationIds.length === 0) {
						throw new Error(
							"Users and organizations must be populated before posts.",
						);
					}
					const posts = JSON.parse(data).map(
						(post: {
							createdAt: string | number | Date;
							updatedAt: string | number | Date;
							pinnedAt: string | number | Date;
						}) => ({
							...post,
							id: uuidv4(), // Convert to valid UUID
							createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
							updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
							pinnedAt: post.pinnedAt ? new Date(post.pinnedAt) : null,
							creatorId: userIds[Math.floor(Math.random() * userIds.length)], // Use valid user ID
							updaterId: userIds[Math.floor(Math.random() * userIds.length)], // Use valid user ID
							organizationId:
								organizationIds[
									Math.floor(Math.random() * organizationIds.length)
								], // Use valid organization ID
						}),
					) as (typeof schema.postsTable.$inferInsert)[];
					await db.insert(schema.postsTable).values(posts);
					break;
				}
				case "events": {
					if (userIds.length === 0 || organizationIds.length === 0) {
						throw new Error(
							"Users and organizations must be populated before events.",
						);
					}
					type EventType = {
						name: string;
						description: string;
						createdAt: string | number | Date;
						updatedAt: string | number | Date;
						startAt: string | number | Date;
						endAt: string | number | Date;
					};
					const events = JSON.parse(data).map((event: EventType) => ({
						...event,
						id: uuidv4(), // Convert to valid UUID
						name: event.name,
						description: event.description,
						createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
						updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
						startAt: event.startAt ? new Date(event.startAt) : new Date(),
						endAt: event.endAt ? new Date(event.endAt) : new Date(),
						creatorId: userIds[Math.floor(Math.random() * userIds.length)], // Use valid user ID
						updaterId: userIds[Math.floor(Math.random() * userIds.length)], // Use valid user ID
						organizationId:
							organizationIds[
								Math.floor(Math.random() * organizationIds.length)
							], // Use valid organization ID
					})) as (typeof schema.eventsTable.$inferInsert)[];
					await db.insert(schema.eventsTable).values(events);
					break;
				}
				default:
					console.log("\x1b[31m", `Invalid table name: ${collection}`);
					break;
			}

			console.log("\x1b[35m", `Added ${collection} table data`);
		}

		await checkCountAfterImport();
		await queryClient.end();

		console.log("\nTables populated successfully");
	} catch (err) {
		console.error("\x1b[31m", `Error adding data to tables: ${err}`);
	} finally {
		process.exit(0);
	}
}

/**
 * Checks record counts in specified tables after data insertion.
 */
async function checkCountAfterImport(): Promise<void> {
	try {
		const tables = [
			{ name: "users", table: schema.usersTable },
			{ name: "organizations", table: schema.organizationsTable },
			{ name: "posts", table: schema.postsTable },
			{ name: "events", table: schema.eventsTable },
		];

		console.log("\nRecord Counts After Import:\n");

		console.log(
			`${"| Table Name".padEnd(30)}| Record Count |
${"|".padEnd(30, "-")}|----------------|
`,
		);

		for (const { name, table } of tables) {
			const result = await db
				.select({ count: sql<number>`count(*)` })
				.from(table);

			const count = result?.[0]?.count ?? 0;
			console.log(`| ${name.padEnd(28)}| ${count.toString().padEnd(15)}|`);
		}
	} catch (err) {
		console.error("\x1b[31m", `Error checking record count: ${err}`);
	}
}

const collections = ["users", "organizations", "posts", "events"];

const args = process.argv.slice(2);
const options: LoadOptions = {
	format: args.includes("--format") || args.includes("-f"),
	items: undefined,
};

const itemsIndex = args.findIndex((arg) => arg === "--items" || arg === "-i");
if (itemsIndex !== -1 && args[itemsIndex + 1]) {
	const items = args[itemsIndex + 1];
	options.items = items ? items.split(",") : undefined;
}

(async (): Promise<void> => {
	await listSampleData();
	await insertCollections(options.items || collections, options);
=======
async function listSampleData(): Promise<void> {
  try {
    const sampleDataPath = path.join(__dirname, "../../sample_data");
    const files = await fs.readdir(sampleDataPath);

    console.log("Sample Data Files:\n");

    console.log(
      "| File Name".padEnd(30) +
        "| Document Count |\n" +
        "|".padEnd(30, "-") +
        "|----------------|\n",
    );

    for (const file of files) {
      const filePath = path.join(sampleDataPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        const data = await fs.readFile(filePath, "utf8");
        const docs = JSON.parse(data);
        console.log(
          `| ${file.padEnd(28)}| ${docs.length.toString().padEnd(15)}|`,
        );
      }
    }
    console.log();
  } catch (err) {
    console.error("\x1b[31m", `Error listing sample data: ${err}`);
  }
}

/**
 * Clears all collections in the database.
 */
async function formatDatabase(): Promise<void> {
  // Clear all collections
  await Promise.all([
    Community.deleteMany({}),
    User.deleteMany({}),
    Organization.deleteMany({}),
    ActionItemCategory.deleteMany({}),
    AgendaCategoryModel.deleteMany({}),
    Event.deleteMany({}),
    Post.deleteMany({}),
    AppUserProfile.deleteMany({}),
    RecurrenceRule.deleteMany({}),
  ]);
  console.log("Cleared all collections\n");
}

/**
 * Inserts data into specified collections.
 * @param collections - Array of collection names to insert data into
 */
async function insertCollections(collections: string[]): Promise<void> {
  try {
    // Connect to MongoDB database
    await connect();

    const { format } = yargs
      .options({
        items: {
          alias: "i",
          describe:
            "Comma-separated list of collections to load sample data into",
          type: "string",
        },
        format: {
          alias: "f",
          describe:
            "Formats all the collections present in the database before the insertion of objects. [WARNING] Use carefully.",
          type: "boolean",
        },
      })
      .parseSync() as InterfaceArgs;

    // Check if formatting is requested
    if (format) {
      await formatDatabase();
    }

    // Insert data into each specified collection
    for (const collection of collections) {
      const data = await fs.readFile(
        path.join(__dirname, `../../sample_data/${collection}.json`),
        "utf8",
      );
      const docs = JSON.parse(data) as Record<string, unknown>[];

      switch (collection) {
        case "users":
          await User.insertMany(docs);
          break;
        case "organizations":
          await Organization.insertMany(docs);
          break;
        case "actionItemCategories":
          await ActionItemCategory.insertMany(docs);
          break;
        case "agendaCategories":
          await AgendaCategoryModel.insertMany(docs);
          break;
        case "events":
          await Event.insertMany(docs);
          break;
        case "recurrenceRules":
          await RecurrenceRule.insertMany(docs);
          break;
        case "posts":
          await Post.insertMany(docs);
          break;
        case "appUserProfiles":
          await AppUserProfile.insertMany(docs);
          break;
        default:
          console.log("\x1b[31m", `Invalid collection name: ${collection}`);
          break;
      }

      console.log("\x1b[35m", `Added ${collection} collection`);
    }

    // Check document counts after import
    await checkCountAfterImport();

    console.log("\nCollections added successfully");
  } catch (err) {
    console.error("\x1b[31m", `Error adding collections: ${err}`);
  } finally {
    process.exit(0);
  }
}

/**
 * Checks document counts in specified collections after data insertion.
 */
async function checkCountAfterImport(): Promise<void> {
  try {
    // Connect to MongoDB database
    await connect();

    const collections = [
      { name: "users", model: User },
      { name: "organizations", model: Organization },
      { name: "actionItemCategories", model: ActionItemCategory },
      { name: "agendaCategories", model: AgendaCategoryModel },
      { name: "events", model: Event },
      { name: "recurrenceRules", model: RecurrenceRule },
      { name: "posts", model: Post },
      { name: "appUserProfiles", model: AppUserProfile },
    ];

    console.log("\nDocument Counts After Import:\n");

    // Table header
    console.log(
      "| Collection Name".padEnd(30) +
        "| Document Count |\n" +
        "|".padEnd(30, "-") +
        "|----------------|\n",
    );

    // Display document counts for each collection
    for (const { name, model } of collections) {
      const count = await model.countDocuments();
      console.log(`| ${name.padEnd(28)}| ${count.toString().padEnd(15)}|`);
    }
  } catch (err) {
    console.error("\x1b[31m", `Error checking document count: ${err}`);
  }
}

// Default collections available to insert
const collections = [
  "users",
  "organizations",
  "posts",
  "events",
  "recurrenceRules",
  "appUserProfiles",
  "actionItemCategories",
  "agendaCategories",
];

// Check if specific collections need to be inserted
const { items: argvItems } = yargs
  .options({
    items: {
      alias: "i",
      describe: "Comma-separated list of collections to load sample data into",
      type: "string",
    },
  })
  .parseSync() as InterfaceArgs;

(async (): Promise<void> => {
  if (argvItems) {
    const specificCollections = argvItems.split(",");
    await listSampleData();
    await insertCollections(specificCollections);
  } else {
    await listSampleData();
    await insertCollections(collections);
  }
>>>>>>> b63233d576aed93b17026ccf16e84ff13f5481ab
})();
