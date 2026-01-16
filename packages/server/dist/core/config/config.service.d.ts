import { ConfigService as NestConfigService } from '@nestjs/config';
import { IAppConfig, IDatabaseConfig, IJwtConfig, IRedisConfig, IConfig } from '@core/contracts/config';
export declare class AppConfigService implements IConfig {
    private readonly configService;
    constructor(configService: NestConfigService);
    get app(): IAppConfig;
    get database(): IDatabaseConfig;
    get jwt(): IJwtConfig;
    get redis(): IRedisConfig;
}
