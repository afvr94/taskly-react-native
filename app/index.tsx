// https://www.nativewind.dev/
import {
  StyleSheet,
  TextInput,
  View,
  FlatList,
  Text,
  LayoutAnimation,
} from "react-native";
import { theme } from "../theme";
import ShoppingListItem from "../components/shopping-list-item";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";
import * as Haptics from "expo-haptics";

const storageKey = "shopping-list";

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAtTimestamp?: number;
  lastUpdatedTimestamp: number;
};

export default function App() {
  const [value, setValue] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(storageKey);
      console.log(data);
      if (!data) return;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShoppingList(data);
    };
    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (!value) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList((prevState) => {
      const newItem = {
        id: prevState.length.toString(),
        name: value,
        lastUpdatedTimestamp: Date.now(),
      };
      const newList = [newItem, ...prevState];
      saveToStorage(storageKey, newList);
      return newList;
    });
    setValue("");
  };

  const handleOnDelete = (itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShoppingList((prevState) => {
      const updatedList = prevState.filter((item) => item.id !== itemId);
      saveToStorage(storageKey, updatedList);
      return updatedList;
    });
  };

  const handleOnToggleComplete = (itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList((prevState) => {
      const updatedList = prevState.map((item) => {
        if (item.id !== itemId) return item;
        if (item.completedAtTimestamp) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return {
          ...item,
          lastUpdatedTimestamp: Date.now(),
          completedAtTimestamp: item.completedAtTimestamp
            ? undefined
            : Date.now(),
        };
      });
      saveToStorage(storageKey, updatedList);
      return updatedList;
    });
  };

  return (
    <FlatList
      data={orderShoppingList(shoppingList)}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      ListHeaderComponent={
        <TextInput
          style={styles.textInput}
          placeholder="E.g. Coffee"
          value={value}
          onChangeText={setValue}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      }
      renderItem={({ item }) => {
        return (
          <ShoppingListItem
            name={item.name}
            onDelete={() => handleOnDelete(item.id)}
            onToggleComplete={() => handleOnToggleComplete(item.id)}
            isCompleted={Boolean(item.completedAtTimestamp)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    paddingTop: 12,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 10,
    backgroundColor: theme.colorWhite,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }

    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }

    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }

    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
    }

    return 0;
  });
}
