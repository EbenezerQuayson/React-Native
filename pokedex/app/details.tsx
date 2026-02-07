import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, View, StyleSheet } from "react-native";

type PokemonDetails = {
  name: string;
  id: number;
  height: number;
  weight: number;
  sprites?: {
    front_default?: string;
  };
  types?: Array<{
    slot: number;
    type: { name: string };
  }>;
  stats?: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
};

export default function Details() {
  const params = useLocalSearchParams();
  const nameParam = useMemo(() => {
    const raw = params?.name;
    if (Array.isArray(raw)) return raw[0];
    return raw ? String(raw) : "";
  }, [params]);

  const [data, setData] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPokemonDetails() {
      if (!nameParam) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${nameParam.toLowerCase()}`
        );
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const json = (await response.json()) as PokemonDetails;
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unknown error occurred"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPokemonDetails();
    return () => {
      cancelled = true;
    };
  }, [nameParam]);

  return (
    <>
      <Stack.Screen options={{ title: nameParam || "Details" }} />
      <ScrollView contentContainerStyle={styles.container}>
        {!nameParam ? (
          <Text style={styles.errorText}>No Pokemon selected.</Text>
        ) : loading ? (
          <Text style={styles.infoText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : !data ? (
          <Text style={styles.infoText}>No data available.</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{data.name}</Text>
              <Text style={styles.id}>#{data.id}</Text>
            </View>

            {data.sprites?.front_default ? (
              <Image
                source={{ uri: data.sprites.front_default }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : null}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Height: {data.height}</Text>
              <Text style={styles.metaText}>Weight: {data.weight}</Text>
            </View>

            {data.types?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Types</Text>
                <View style={styles.chipRow}>
                  {data.types
                    .sort((a, b) => a.slot - b.slot)
                    .map((t) => (
                      <View key={t.type.name} style={styles.chip}>
                        <Text style={styles.chipText}>{t.type.name}</Text>
                      </View>
                    ))}
                </View>
              </View>
            ) : null}

            {data.stats?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stats</Text>
                {data.stats.map((s) => (
                  <View key={s.stat.name} style={styles.statRow}>
                    <Text style={styles.statName}>{s.stat.name}</Text>
                    <Text style={styles.statValue}>{s.base_stat}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  id: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 200,
    alignSelf: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statName: {
    fontSize: 14,
    textTransform: "capitalize",
    color: "#4b5563",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  errorText: {
    fontSize: 14,
    color: "#b91c1c",
  },
});
