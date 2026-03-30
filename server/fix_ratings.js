require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("./models/Review");
const Professor = require("./models/Professor");

async function fixRatings() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("localhost")) {
    console.log("\n⚠️ WARNING: You are connecting to the local database.");
    console.log("If you want to update your LIVE Vercel/Render application, make sure to temporarily update server/.env so that MONGODB_URI=your_atlas_connection_string!\n");
  }

  try {
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected! Recomputing data...");

    // 1. Update individual reviews
    const reviews = await Review.find({});
    let updatedCount = 0;
    
    for (const review of reviews) {
      const computedRating = ((review.teachingQuality + review.difficulty + review.gradingStrictness + review.attendanceStrictness) / 4);
      const roundedRating = parseFloat(computedRating.toFixed(1));
      
      if (review.rating !== roundedRating) {
        review.rating = roundedRating;
        await review.save();
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} individual reviews to use the new average calculation.`);

    // 2. Recompute professor aggregates so the database perfectly matches
    const professors = await Professor.find({});
    let profCount = 0;

    for (const professor of professors) {
      const profReviews = await Review.find({ professorId: professor._id });
      const count = profReviews.length;
      
      if (count > 0) {
        const sum = (field) => profReviews.reduce((acc, r) => acc + r[field], 0);
        
        professor.totalReviews = count;
        professor.averageRating = parseFloat((sum("rating") / count).toFixed(2));
        professor.averageTeachingQuality = parseFloat((sum("teachingQuality") / count).toFixed(2));
        professor.averageDifficulty = parseFloat((sum("difficulty") / count).toFixed(2));
        professor.averageGradingStrictness = parseFloat((sum("gradingStrictness") / count).toFixed(2));
        professor.averageAttendanceStrictness = parseFloat((sum("attendanceStrictness") / count).toFixed(2));
        
        await professor.save();
        profCount++;
      }
    }
    console.log(`✅ Recomputed total averages for ${profCount} professors.`);

  } catch (error) {
    console.error("❌ Error updating records:", error);
  } finally {
    mongoose.disconnect();
    console.log("👋 Disconnected.");
  }
}

fixRatings();
