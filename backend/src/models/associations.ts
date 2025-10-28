import userModel from "./userModel";
import Pokemon from "./pokemonModel";

userModel.hasMany(Pokemon, { foreignKey: "createdBy", as: "pokemons" });
Pokemon.belongsTo(userModel, { foreignKey: "createdBy", as: "creator" });

export { userModel, Pokemon };
