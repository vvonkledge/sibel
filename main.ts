import Oswald from "./core/oswald.ts";
import CreateUser, { CreateUserCommand } from "./example/create-user/index.ts";
import "reflect-metadata";

if (import.meta.main) {
  const oswald = new Oswald();
  oswald.registerFeature(CreateUser);

  const command = new CreateUserCommand("John Doe", "john.doe@example.com");
  oswald.serve(command);
}
