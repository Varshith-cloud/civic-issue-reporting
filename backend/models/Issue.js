const IssueSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: String,
  image: String,
  status: {
    type: String,
    default: "Pending"
  },
 
  createdAt: {
    type: Date,
    default: Date.now
  }
});
