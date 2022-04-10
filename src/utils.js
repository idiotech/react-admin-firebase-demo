function getRecordField(props, field) {
    if (props.record) {
      return props.record[field];
    } else {
      console.trace();
      alert('連線逾期。');
      window.location.reload();
      return null;
    }
  }

export { getRecordField }