// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from "sequelize";
import { Application } from "../declarations";
import { HookReturn } from "sequelize/types/lib/hooks";

export default function (app: Application): typeof Model {
    const sequelizeClient: Sequelize = app.get("sequelizeClient");
    const fabricantes = sequelizeClient.define("fabricantes", 
        {
            nombre: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        },
        {
            hooks: {
                beforeCount(options: any): HookReturn {
                    options.raw = true;
                }
            }
        });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (fabricantes as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return fabricantes;
}