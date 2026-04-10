import { Injectable } from "@nestjs/common";
import { BrowserHelper } from "./browser.helper";
import { DeviceHelper } from "./device.helper";
import { TypeEnduser } from "src/commons/enums/type-enduser.enum";
import { IEventHelper } from "./helper.interface";
import { DefaultHelper } from "./default.helper";

@Injectable()
export class EventHelperFactory {
  constructor(
    private readonly browserHelper: BrowserHelper,
    private readonly deviceHelper: DeviceHelper,
    private readonly defaultHelper: DefaultHelper
  ) {}

  getHelper(type: TypeEnduser): IEventHelper {
    const map: Record<string, IEventHelper> = {
      browser: this.browserHelper,
      desktop: this.browserHelper,
      device: this.deviceHelper,
      self: this.defaultHelper,
      server: this.defaultHelper
    };
    return map[type];
  }
}