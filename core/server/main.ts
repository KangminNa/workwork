
import { CoreServer } from "./core-server";
import TestModule from "../../test/server/test.module";

const app = new CoreServer([TestModule]);
app.setup().listen(3000);
