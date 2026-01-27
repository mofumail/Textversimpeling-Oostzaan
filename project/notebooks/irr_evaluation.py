import pandas as pd
import numpy as np

def krippendorff_alpha_ordinal(reliability_data):
    """
    Calculate Krippendorff's alpha for ordinal data.
    reliability_data: 2D array where rows are raters and columns are items.
                      NaN indicates missing values.
    """
    data = np.array(reliability_data, dtype=float)
    n_raters, n_items = data.shape
    
    # Get all unique values (excluding NaN)
    all_values = data[~np.isnan(data)]
    if len(all_values) == 0:
        return np.nan
    
    values = np.sort(np.unique(all_values))
    n_values = len(values)
    
    # Build ordinal distance metric
    def ordinal_distance(v1, v2):
        i1 = np.where(values == v1)[0][0]
        i2 = np.where(values == v2)[0][0]
        return (i1 - i2) ** 2
    
    # Calculate observed disagreement (Do)
    Do = 0
    n_pairs = 0
    
    for item in range(n_items):
        ratings = data[:, item]
        valid_ratings = ratings[~np.isnan(ratings)]
        m = len(valid_ratings)
        if m < 2:
            continue
        
        for i in range(m):
            for j in range(i + 1, m):
                Do += ordinal_distance(valid_ratings[i], valid_ratings[j])
                n_pairs += 1
    
    if n_pairs == 0:
        return np.nan
    
    Do = Do / n_pairs
    
    # Calculate expected disagreement (De)
    value_counts = {}
    for v in values:
        value_counts[v] = np.sum(data == v)
    
    total_ratings = sum(value_counts.values())
    
    De = 0
    total_pairs = 0
    for v1 in values:
        for v2 in values:
            if v1 != v2:
                pair_count = value_counts[v1] * value_counts[v2]
                De += ordinal_distance(v1, v2) * pair_count
                total_pairs += pair_count
    
    if total_pairs == 0:
        return np.nan
    
    De = De / total_pairs
    
    if De == 0:
        return 1.0
    
    return 1 - (Do / De)

def load_evaluation_data(filepath):
    """
    Expected Excel structure:
    Columns: Rater, Sentence_ID, Model, Iteration, Fluency, Adequacy, Simplicity
    
    - 12 raters, each rating 20 sentences = 240 rows per model/iteration combo
    - Models: Baseline, Model, Human Reference
    - Iterations: 1, 2 (for Model only; Baseline and Human Reference appear in both)
    """
    df = pd.read_excel(filepath)
    return df

def calculate_krippendorff_alpha(df, metric, iteration):
    """Calculate Krippendorff's alpha for a given metric and iteration."""
    subset = df[df['Iteration'] == iteration]
    
    # Pivot: rows = raters, columns = sentence_id
    pivot = subset.pivot_table(index='Rater', columns='Sentence_ID', values=metric, aggfunc='first')
    
    reliability_data = pivot.values
    
    return krippendorff_alpha_ordinal(reliability_data)

def calculate_aggregated_scores(df, model_name):
    """Calculate mean and std for each metric for a given model."""
    subset = df[df['Model'] == model_name]
    
    results = {}
    for metric in ['Fluency', 'Adequacy', 'Simplicity']:
        mean = subset[metric].mean()
        std = subset[metric].std()
        results[metric] = (mean, std)
    
    return results

def format_score(mean, std):
    """Format score as 'mean (± std)'."""
    return f"{mean:.2f} (± {std:.2f})"

def generate_tables(filepath):
    df = load_evaluation_data(filepath)
    
    for metric in ['Fluency', 'Adequacy', 'Simplicity']:
        alpha_1 = calculate_krippendorff_alpha(df, metric, iteration=1)
        alpha_2 = calculate_krippendorff_alpha(df, metric, iteration=2)
        print(f"{metric:<15} {alpha_1:<15.3f} {alpha_2:<15.3f}")
    
    print("\n")

    models = [
        ('Baseline (Leesplank)', 'Baseline'),
        ('Model Iteration 1', 'Model_Iter1'),
        ('Model Iteration 2', 'Model_Iter2'),
        ('Human Reference', 'Human')
    ]
    
    for display_name, model_key in models:
        scores = calculate_aggregated_scores(df, model_key)
        fluency = format_score(*scores['Fluency'])
        adequacy = format_score(*scores['Adequacy'])
        simplicity = format_score(*scores['Simplicity'])
        print(f"{display_name:<25} {fluency:<15} {adequacy:<15} {simplicity:<15}")
    


if __name__ == "__main__":
    excel_file = "evaluation_data.xlsx"
    # Generate the tables
    generate_tables(excel_file)
