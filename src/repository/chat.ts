function add(id: number) {
  console.log("Bot added to chat", id);
}

function remove(id: number) {
  console.log("Bot deleted from chat", id);
}

export const chatRepository = {
  add,
  remove,
};
