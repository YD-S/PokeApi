import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "@sequelize/core";
import sequelize from "../config/database";

class Pokemon extends Model<
    InferAttributes<Pokemon>,
    InferCreationAttributes<Pokemon>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare prompt: string;
    declare imageUrl: string;
    declare createdBy: number;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;
    declare isPublic: CreationOptional<boolean>;
}

Pokemon.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrlOrPath(value: string) {
                    if (!value.startsWith("/uploads/") && !value.startsWith("http")) {
                        throw new Error("imageUrl must be a valid URL or local path");
                    }
                },
            },
        },
        createdBy: {
            type: DataTypes.INTEGER.UNSIGNED,
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
        tableName: "pokemons",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Pokemon;
