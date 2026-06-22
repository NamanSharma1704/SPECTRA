export default {
  "no-intelligence-fallbacks": {
    meta: {
      type: "problem",
      docs: {
        description: "disallow fallback logic like || 0 or ?? 0 for intelligence states",
      },
      schema: [],
    },
    create(context) {
      return {
        LogicalExpression(node) {
          if (
            (node.operator === "||" || node.operator === "??") &&
            node.right.type === "Literal" &&
            node.right.value === 0
          ) {
            // Further refine to only catch specific variables if needed, 
            // but the rule is applied to specific directories where ANY || 0 is considered dangerous for intel states.
            const name = node.left.type === "Identifier" ? node.left.name : 
                         node.left.type === "MemberExpression" && node.left.property.type === "Identifier" ? node.left.property.name : null;
            
            // Just to be safe, only target intelligence-related fields
            const intelligenceFields = [
              "metaScore", "trustScore", "forecastConfidence", "consensusScore", 
              "trust_score", "accuracy", "confidence", "consensus", "hybrid_accuracy", "accuracy_90d", "accuracy_lifetime",
              "oldScore", "scoreA", "scoreB"
            ];

            if (name && intelligenceFields.some(f => name.includes(f))) {
              context.report({
                node,
                message: "Do not fallback to 0 for intelligence metrics. Use IntelligenceState instead (Unknown ≠ Zero)."
              });
            } else if (!name) {
              // If we can't determine the name, err on the side of caution?
              // The user said "apply it to src/server/services/, src/server/repositories/, and src/app/api/"
              // Let's just ban || 0 and ?? 0 entirely in these folders for any field ending in score or anything really,
              // but limiting to known fields prevents false positives for standard IDs.
            }
          }
        },
      };
    },
  },
};
