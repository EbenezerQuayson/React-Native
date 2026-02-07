import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View, StyleSheet, Pressable } from "react-native";

interface Pokemon{
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
}

interface PokemonType{
  type:{
    name: string;
    url: string;
  }
  
}

const colorsByType: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
}

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  useEffect(()=> {
    //fetch data from pokeapi
    fetchPokemons();
    }, []);

    async function fetchPokemons(){
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
        const data = await response.json();
        //Fetch detailed info for each Pokemon in parallel
        const detailedPokemons = await Promise.all(
          data.results.map(async (pokemon: any) => {
            const res = await fetch(pokemon.url);
            const details = await res.json();
            return {
              name: pokemon.name,
              url: pokemon.url,
              image: details.sprites.front_default, // main sprite
              imageBack: details.sprites.back_default, // back sprite
              types: details.types,
            };
          })
        );
        // console.log(detailedPokemons);
        setPokemons(detailedPokemons);
      } catch(e){
        console.log(e);
      }
    }
  return (
    <ScrollView 
    contentContainerStyle={{
      padding: 16,
      gap: 16,
    }}
    >
      {pokemons.map((pokemon) => (
        <Link key={pokemon.name} 
        href={{pathname:"/details", params:{name:pokemon.name, image:pokemon.image, imageBack:pokemon.imageBack, types: JSON.stringify(pokemon.types)}}}
        style={{
          //@ts-ignore
          backgroundColor: colorsByType[pokemon.types[0].type.name] + 50, // Add transparency to the color,
          padding: 20,
          borderRadius: 20,
        }}
        >
        <View >

          <Text style={styles.name}>{pokemon.name}</Text>
          <Text style={styles.type}>{pokemon.types[0].type.name}</Text>
          <View style={{
            flexDirection: "row",
          }}>
          <Image
          source={{uri: pokemon.image}}
          style={styles.image}
          />

          <Image
          source={{uri: pokemon.imageBack}}
          style={styles.image}
          />
          </View>
        </View>
      </Link>

      ))}
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  name:{
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center"
  },
   type:{
    fontSize: 28,
    fontWeight: "bold",
    color:"gray",
    textAlign: "center",
  },
   image:{
    width: 100,
    height: 100,
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",


   }
});