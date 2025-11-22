
import { CoreServer } from "./core-server";
import TestModule from "../../test/server/module";

const app = new CoreServer([TestModule]);
app.setup().listen(3000);
