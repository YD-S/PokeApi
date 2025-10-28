import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from "@sequelize/core";
import sequelize from "../config/database";
import userModel from "./userModel";

class Token extends Model<
    InferAttributes<Token>,
    InferCreationAttributes<Token>
> {
    declare id: CreationOptional<number>;
    declare user_id: ForeignKey<userModel["id"]>;
    declare jti: string;
    declare revoked: CreationOptional<boolean>;
    declare expires_at: Date;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
}

Token.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        jti: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        revoked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "refresh_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Token.belongsTo(userModel, { foreignKey: "user_id", as: "user" });

export default Token;
