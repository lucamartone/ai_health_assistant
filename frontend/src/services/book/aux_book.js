  export function formatSlots(data) {
    const slotsMap = {};
    data.forEach(item => {
      const [datePart, timePart] = item.date_time.split('T');
      const time = timePart.slice(0, 5); // Solo HH:mm
      if (!slotsMap[datePart]) {
        slotsMap[datePart] = [];
      }
      slotsMap[datePart].push(time);
    });
    return slotsMap;
  };