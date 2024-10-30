interface Slot {
  display: "hidden" | "visible";
  time: string;
}

interface TimeSlot {
  hour: number;
  slots: Slot[];
}

export const timeSlots: TimeSlot[] = [
  {
    hour: 1,
    slots: [
      {
        display: "visible",
        time: "1PM",
      },
      {
        display: "hidden",
        time: "1:15PM",
      },

      {
        display: "hidden",
        time: "1:30PM",
      },
      {
        display: "hidden",
        time: "1:45PM",
      },
    ],
  },
  {
    hour: 2,
    slots: [
      {
        display: "visible",
        time: "2PM",
      },
      {
        display: "hidden",
        time: "2:15PM",
      },
      {
        display: "hidden",
        time: "2:30PM",
      },
      {
        display: "hidden",
        time: "2:45PM",
      },
    ],
  },
  {
    hour: 3,
    slots: [
      {
        display: "visible",
        time: "3PM",
      },
      {
        display: "hidden",
        time: "3:15PM",
      },
      {
        display: "hidden",
        time: "3:30PM",
      },
      {
        display: "hidden",
        time: "3:45PM",
      },
    ],
  },
  {
    hour: 4,
    slots: [
      {
        display: "visible",
        time: "4PM",
      },
      {
        display: "hidden",
        time: "4:15PM",
      },
      {
        display: "hidden",
        time: "4:30PM",
      },
      {
        display: "hidden",
        time: "4:45PM",
      },
    ],
  },
  {
    hour: 5,
    slots: [
      {
        display: "visible",
        time: "5PM",
      },
    ],
  },
];
