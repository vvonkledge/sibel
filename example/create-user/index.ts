import { Injectable } from "../../core/container.ts";
import Slice, { Command, CommandHandler, Feature } from "../../core/feature.ts";

export class CreateUserCommand implements Command {
  type = "CreateUser";

  constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}

@Injectable()
class Repository {
  public save() {
    console.log("save");
  }
}

@Injectable()
class CreateUserHandler implements CommandHandler<CreateUserCommand> {
  constructor(private readonly repository: Repository) {}
  public execute(command: CreateUserCommand): void {
    console.log(command);
    console.log("I am inside the handler");
    this.repository.save();
  }
}

@Slice({
  TRIGGER: CreateUserCommand,
  HANDLER: CreateUserHandler,
})
class CreateUser extends Feature {}

export default CreateUser;
