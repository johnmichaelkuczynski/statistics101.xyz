// AUTO-GENERATED from attached_assets/Clean_Statistics_101_Course_Book.docx — verbatim curriculum content.

export interface Module {
  id: string;
  number: number;
  title: string;
  points: number;
  type: "discussion" | "essay" | "termpaper";
  objectives: string[];
  reading: string;
  assignment: string;
  modelResponse?: string;
}

export const modules: Module[] = [
  {
    id: "d1",
    number: 1,
    title: "Discussion 1: Types of Data",
    points: 50,
    type: "discussion",
    objectives: [
      "Distinguish the four levels of measurement: categorical (nominal), ordinal, interval, and ratio.",
      "Identify which summary statistics are meaningful for each data type and recognize common type-mismatch errors.",
    ],
    reading: `Background

Before you can analyze data, you have to know what kind of data you have. The same number — say, the number 3 — can mean very different things, and the statistical operations that make sense depend entirely on the type of data.

There are four standard types of data, often called the four levels of measurement:

CATEGORICAL (also called NOMINAL) data places observations into named categories with no inherent order. Examples: eye color (blue, brown, green), blood type (A, B, AB, O), the political party someone is registered with. You can count how many observations fall in each category, but you cannot meaningfully average them. The "average eye color" of a class is not a meaningful number.

ORDINAL data places observations in categories that have a natural order, but the spacing between categories is not necessarily equal. Examples: education level (high school, bachelor's, master's, doctorate), satisfaction ratings on a survey (very dissatisfied, dissatisfied, neutral, satisfied, very satisfied), military ranks. You can say one observation is "higher" than another, but you cannot say it is "twice as high" — the gap between "satisfied" and "very satisfied" is not necessarily the same as the gap between "neutral" and "satisfied."

INTERVAL data is numerical, with equal spacing between values, but no meaningful zero point. The classic example is temperature in Fahrenheit or Celsius: 80°F is not "twice as hot" as 40°F because zero degrees does not mean "no temperature." Differences are meaningful (the gap from 30°F to 40°F is the same as 70°F to 80°F), but ratios are not.

RATIO data is numerical, with equal spacing AND a true zero. Examples: height, weight, age, income, time elapsed, count of anything. Zero income really does mean no income; 80 kg is genuinely twice as much as 40 kg. All arithmetic operations make sense.

Why this matters: the type of data determines which summary statistics and which statistical tests are appropriate. You can compute the mean of ratio data; you cannot meaningfully compute the mean of categorical data. You can rank-order ordinal data but not compute its standard deviation in a meaningful way. Beginning statistics students who skip this classification step often end up performing computations that produce numbers but no useful information.`,
    assignment: `Assignment (50 points)

Choose ONE study or dataset you can describe — it can be a real one (a survey you took, a study you read about) or a hypothetical one you make up. Then:

1. Describe the study briefly
2. Identify at least FOUR variables collected in the study
3. For each variable, classify it as categorical, ordinal, interval, or ratio
4. For each variable, give one example of a meaningful summary you could compute, and one example of a summary that would NOT be meaningful given the variable's type
5. Identify ONE pitfall that might arise if someone mishandled the type of one of these variables`,
    modelResponse: `Model Response

Study chosen: a customer satisfaction survey conducted by a regional coffee chain at 40 of its locations. Each customer who completes the survey provides several pieces of information.

Four variables:

STORE_ID — the identifier of the store where the customer was surveyed (e.g., "Store 17," "Store 32"). Categorical (nominal). Even though the IDs are numbers, they are just labels — Store 17 is not "more than" Store 16 in any meaningful sense.

SATISFACTION — the customer's rating of their visit on a 5-point scale (1 = very dissatisfied, 5 = very satisfied). Ordinal. The categories are ordered, but the gap between rating 1 and rating 2 is not necessarily the same as the gap between 4 and 5.

TEMPERATURE_F — the temperature outside in Fahrenheit at the time of the visit. Interval. Equal spacing between values, but 0°F does not mean "no temperature," so ratios are not meaningful.

AMOUNT_SPENT — how many dollars the customer spent on the visit. Ratio. Zero dollars means zero spending, and $20 spent is genuinely twice as much as $10 spent.

Meaningful and non-meaningful summaries for each:

STORE_ID: meaningful — count how many customers were surveyed at each store, find the mode (most-surveyed store). Not meaningful — compute the average store ID. "The average store is 24.5" is nonsense.

SATISFACTION: meaningful — find the median rating, count how many customers rated 4 or above. Not meaningful, strictly speaking — compute the mean rating, although in practice this is done all the time and treated as approximately interval. (We will discuss this practice and its risks below.)

TEMPERATURE_F: meaningful — compute the mean temperature, the range, the standard deviation. Not meaningful — say "today was twice as warm as yesterday" because 80°F is twice the NUMBER of 40°F, but not twice the heat in any physical sense.

AMOUNT_SPENT: meaningful — every standard summary statistic (mean, median, standard deviation, total revenue, ratios between groups). Not meaningful — there is no operation on ratio data that lacks a defensible interpretation.

A pitfall: the temptation to compute means of ordinal data is widespread and risky. Many businesses report "average customer satisfaction" by averaging the 1–5 ratings, even though this is technically inappropriate. The danger is that the mean is sensitive to the assumption that the gap from 1 to 2 equals the gap from 4 to 5 — and customer-satisfaction researchers have shown that respondents often use the extreme categories asymmetrically. A score of 4 ("satisfied") might be very common among neutral customers who are reluctant to say something negative, while a score of 1 might be reserved for genuinely furious customers. Treating these as equally-spaced numbers can hide important information. The safer summary is the percentage of customers giving a rating of 4 or 5, or the median, or the full distribution. When we see "average satisfaction = 3.8" in a company report, we should remember it is built on an assumption that may not hold.

Why This Is a Model Response

All four classifications are correct, including the subtle case of STORE_ID looking numerical but being categorical. Numeric labels are not the same as numeric measurements.

The student gives both a meaningful and a non-meaningful summary for each variable, demonstrating understanding rather than just labeling.

The pitfall discussion is real and current. Treating Likert scales as interval data is the single most common type-mismatch error in applied statistics, and the model response identifies the specific failure mode (asymmetric use of extreme categories).

The reflection notes a defensive practice — reporting the percentage of top-box ratings or the median — that the student would actually use in real analysis. The student is not just identifying the problem but proposing the standard fix.

The example is concrete and bounded. A customer satisfaction survey at 40 stores is small enough to think about, large enough to have meaningful variation.`,
  },
  {
    id: "e1",
    number: 2,
    title: "Essay 1: Measures of Central Tendency",
    points: 50,
    type: "essay",
    objectives: [
      "Define and compute the mean, median, and mode and identify the strengths and weaknesses of each.",
      "Choose the appropriate measure of center for a given data type and distribution shape, and defend the choice.",
    ],
    reading: `Background

Once you have data, the first question is usually: where is the center? Three different statistics answer "center" in three different ways, and the difference matters.

The MEAN is what most people call "the average." Add up all the values, divide by the number of values:

mean = (sum of all values) / n

In symbols, the population mean is μ (mu) and the sample mean is x̄ (x-bar). The mean uses every value in the dataset and is sensitive to outliers — one extreme value can pull it noticeably.

$$\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$$

The MEDIAN is the middle value when you sort the data from smallest to largest. If there is an odd number of values, the median is the single middle one. If there is an even number, it is the average of the two middle ones. The median uses position rather than magnitude, so it is resistant to outliers — extreme values do not pull it.

The MODE is the value that occurs most frequently. There can be one mode, several modes (multimodal data), or no mode if every value occurs equally often. The mode is the only measure of center that works for categorical data — you can speak of "the most common eye color" but not "the average eye color."

Which measure to use depends on three things: the type of data, the shape of the distribution, and what you are trying to communicate.

For symmetric, well-behaved numerical data without strong outliers: the mean is fine, and is preferred because it uses all the information.

For skewed numerical data, or data with outliers: the median is usually better, because it is not pulled by the long tail.

For categorical data: only the mode applies.

For ordinal data: the median is the safest choice; the mode is sometimes useful; the mean is technically inappropriate.

A famous illustration: imagine a small town where ten people each earn $40,000 per year, and one person — the wealthy retiree on the hill — earns $4,000,000. The mean income is around $400,000. The median income is $40,000. Which number better represents "what people in this town make"? Almost certainly the median. The mean is mathematically correct but practically misleading. This is why income statistics in journalism are usually reported as medians, not means.`,
    assignment: `Assignment (50 points)

Section 1 (10 points) — Definitions
In your own words, define mean, median, and mode. State at least one strength and one weakness of each as a measure of center.

Section 2 (20 points) — Computation
You are given the following dataset of 11 values, representing the ages of customers at a coffee shop on a given afternoon:

   23, 19, 28, 35, 41, 22, 24, 67, 26, 30, 25

Compute, showing your work:
- The mean
- The median (sort the data first; show the sorted list)
- The mode, if any

Then describe in 2–3 sentences what each statistic tells you about this group of customers, and which one you would report if a journalist asked "what's the typical age of customers at this shop?" — and why.

Section 3 (20 points) — Choosing a Measure
Construct an original example (real or hypothetical) of a dataset where the MEAN and the MEDIAN differ meaningfully. Compute both. Argue which one is the better summary of the dataset and explain why. Discuss what kind of misleading impression a reader could get if the wrong measure were chosen.`,
    modelResponse: `Model Response

Section 1: Definitions

The MEAN is the arithmetic average — sum of all values divided by the number of values. Strength: uses every data point and is the foundation of most further statistical methods (variance, standard deviation, regression). Weakness: a few outliers or a long tail can pull it far from where most data live.

The MEDIAN is the middle value of the sorted dataset. Strength: resistant to outliers; gives a central location even when the distribution is skewed. Weakness: ignores the magnitude of values away from the middle, so it does not summarize spread or carry forward into many further computations.

The MODE is the most frequent value. Strength: the only measure of center that applies to categorical data (most common color, most common word, most common diagnosis). Weakness: may not exist (no value repeats), may be non-unique (multiple modes), and even when it does exist may not lie near the bulk of the data.

Section 2: Computation

Dataset: 23, 19, 28, 35, 41, 22, 24, 67, 26, 30, 25.

Sort the data first:

   19, 22, 23, 24, 25, 26, 28, 30, 35, 41, 67

Mean: add the values and divide by 11.

19 + 22 + 23 + 24 + 25 + 26 + 28 + 30 + 35 + 41 + 67 = 340

mean = 340 / 11 ≈ 30.9

Median: there are 11 values (odd count), so the median is the 6th value of the sorted list, which is 26.

Mode: every value appears exactly once, so there is no mode for this dataset.

Interpretation: the mean of about 30.9 is pulled upward by the 67-year-old outlier. The median of 26 better represents where most customers actually fall — the middle person, with five customers on either side. If a journalist asked for "the typical age of customers," I would report the median of 26 rather than the mean of about 31. The reason: the dataset has an outlier (67 is well above the rest of the values, which cluster in the 19–41 range), and the median is more resistant to that distortion. Reporting the mean would give the impression that the typical customer is in their early thirties, which overstates the age of the population by about five years.

Section 3: A Dataset Where Mean and Median Differ

Example: a small business — say, an architecture firm — has 9 employees. Their annual salaries are:

   $52,000, $58,000, $61,000, $63,000, $65,000, $68,000, $72,000, $80,000, $450,000

The first eight employees are designers, project managers, and admin staff. The ninth is the owner.

Mean salary: sum = $52,000 + $58,000 + $61,000 + $63,000 + $65,000 + $68,000 + $72,000 + $80,000 + $450,000 = $969,000. Divided by 9 = approximately $107,667.

Median salary: with 9 values, the median is the 5th value of the sorted list, which is $65,000.

Which is the better summary: the median ($65,000) is far more informative about what employees at this firm actually earn. The mean ($107,667) is technically the arithmetic average, but it is not earned by anyone — eight of the nine employees earn substantially less, and one earns substantially more. The mean is being driven by a single extreme value (the owner's $450,000), and reporting it as if it represents typical compensation is misleading.

What goes wrong with the wrong measure: suppose the firm advertises "average salary at our company is over $100,000!" to attract job candidates. A candidate reading that figure would reasonably expect their own salary to be in that neighborhood. They would not realize the figure is built on the inclusion of one outlier and that the actual position they are interviewing for likely pays in the $60,000s or $70,000s. The choice between mean and median can be the difference between a transparent statement and a recruitment lie. This is why thoughtful organizations report MEDIAN salary alongside or instead of mean — and why federal agencies typically report MEDIAN household income rather than mean. The mean is mathematically correct; the median is honest about what most people actually experience.

Why This Is a Model Essay

Section 1 connects each measure of center to specific strengths and weaknesses, not just definitions. The student knows what each one is FOR.

In Section 2, the dataset is sorted before any computation. This is the right habit for any median or quartile calculation and prevents off-by-one errors.

The interpretation step in Section 2 connects the numbers to the question a journalist might ask. The model response does not just compute; it argues for which number to communicate.

The Section 3 example uses concrete dollar amounts and a realistic scenario. The student does NOT use the cliched "Bill Gates walks into a bar" example, which would be technically correct but pedagogically tired.

The closing observation about job advertisements — that mean vs. median can be the difference between transparency and deception — gives the technical lesson real-world stakes. This is exactly the kind of statistical literacy a 101 course is supposed to instill.`,
  },
  {
    id: "d2",
    number: 3,
    title: "Discussion 2: Measures of Spread",
    points: 50,
    type: "discussion",
    objectives: [
      "Compute and interpret range, variance, standard deviation, and IQR as measures of spread.",
      "Choose the appropriate measure of spread to pair with the appropriate measure of center for a given distribution.",
    ],
    reading: `Background

Two datasets can have the same mean and still be very different. Consider these:

   Dataset A: 49, 50, 50, 50, 51 — mean = 50
   Dataset B: 10, 30, 50, 70, 90 — mean = 50

Both have a mean of 50, but Dataset A is tightly bunched and Dataset B is widely spread. Reporting only the mean would hide this completely. To understand a dataset, you need a measure of spread — how far the values typically are from the center.

Four standard measures of spread:

RANGE: the difference between the maximum and minimum values. Simple but crude — uses only two values out of the entire dataset.

range = max − min

VARIANCE: the average of the squared deviations from the mean. Uses every data point. The squaring ensures that values above and below the mean both contribute positively (otherwise positive and negative deviations would cancel). Variance is in squared units, which makes it hard to interpret directly — if your data are in inches, your variance is in square inches.

variance = Σ(xᵢ − x̄)² / (n − 1)     for a sample

STANDARD DEVIATION: the square root of the variance. Same units as the original data, which makes it interpretable. The standard deviation is the most commonly reported measure of spread in published research.

s = √[ Σ(xᵢ − x̄)² / (n − 1) ]     for a sample

$$s = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i - \\bar{x})^2}$$

(Note on the n − 1: when computing from a sample to estimate the population standard deviation, we divide by n − 1 rather than n. This is called Bessel's correction. The intuition is that the sample mean is closer to the sample data than the true population mean would be, so deviations are slightly underestimated; dividing by n − 1 instead of n compensates. For now, just remember: SAMPLE standard deviation uses n − 1.)

INTERQUARTILE RANGE (IQR): the spread of the middle 50% of the data. The first quartile (Q1) is the value below which 25% of the data lies; the third quartile (Q3) is the value below which 75% lies; the IQR is Q3 − Q1. Like the median, the IQR is resistant to outliers.

IQR = Q3 − Q1

Which measure to use:
- Range: a quick first look, but rarely the best summary
- Standard deviation: the standard for symmetric distributions and most published research
- IQR: better for skewed data or data with outliers, paired with the median`,
    assignment: `Assignment (50 points)

You are given the following two datasets, both representing test scores for two sections of the same college class:

   Section A: 72, 75, 78, 80, 82, 84, 88, 91, 95, 98
   Section B: 50, 60, 75, 80, 80, 80, 80, 95, 100, 100

Compute, showing your work for each section:
- Mean
- Range
- Standard deviation (you may show the calculation step by step OR briefly describe how you would compute it; what matters is showing you understand the formula)
- Median
- IQR

Then:
- Compare the two sections. Do they have similar centers? Similar spreads?
- Recommend which measure of spread you would report if you had to summarize the two sections to a department chair, and why`,
    modelResponse: `Model Response

Section A: 72, 75, 78, 80, 82, 84, 88, 91, 95, 98 (already sorted)
Section B: 50, 60, 75, 80, 80, 80, 80, 95, 100, 100 (already sorted)

SECTION A computations.

Mean A: sum = 72 + 75 + 78 + 80 + 82 + 84 + 88 + 91 + 95 + 98 = 843. Divide by 10:
x̄_A = 843 / 10 = 84.3

Range A: max − min = 98 − 72 = 26.

Standard deviation A: subtract the mean from each value, square the deviations, sum them, divide by n − 1 = 9, take the square root.

Deviations from 84.3: −12.3, −9.3, −6.3, −4.3, −2.3, −0.3, 3.7, 6.7, 10.7, 13.7
Squared deviations: 151.29, 86.49, 39.69, 18.49, 5.29, 0.09, 13.69, 44.89, 114.49, 187.69
Sum of squared deviations ≈ 662.10
Variance ≈ 662.10 / 9 ≈ 73.57
Standard deviation s_A ≈ √73.57 ≈ 8.58

Median A: with 10 values (even count), the median is the average of the 5th and 6th values: (82 + 84) / 2 = 83.

IQR A: Q1 is the median of the lower half (72, 75, 78, 80, 82), which is 78. Q3 is the median of the upper half (84, 88, 91, 95, 98), which is 91. IQR = 91 − 78 = 13.

SECTION B computations.

Mean B: sum = 50 + 60 + 75 + 80 + 80 + 80 + 80 + 95 + 100 + 100 = 800. Divide by 10:
x̄_B = 800 / 10 = 80.0

Range B: 100 − 50 = 50.

Standard deviation B:
Deviations from 80.0: −30, −20, −5, 0, 0, 0, 0, 15, 20, 20
Squared deviations: 900, 400, 25, 0, 0, 0, 0, 225, 400, 400
Sum ≈ 2350
Variance ≈ 2350 / 9 ≈ 261.11
Standard deviation s_B ≈ √261.11 ≈ 16.16

Median B: average of 5th and 6th values: (80 + 80) / 2 = 80.

IQR B: Q1 is the median of the lower half (50, 60, 75, 80, 80), which is 75. Q3 is the median of the upper half (80, 80, 95, 100, 100), which is 95. IQR = 95 − 75 = 20.

Comparison:

The means are similar (84.3 vs. 80.0) — within about four points. The medians are even closer (83 vs. 80). So the two sections have approximately the same CENTER.

The spreads are dramatically different. Section A has a standard deviation of about 8.6 and an IQR of 13; Section B has a standard deviation of about 16.2 and an IQR of 20. Section B is roughly twice as spread out as Section A. A glance at the raw data confirms this — Section A clusters in the high 70s and 80s, while Section B contains both very low scores (50, 60) and several perfect 100s.

Recommendation for the department chair: I would report the standard deviation, paired with the mean. The standard deviation is the standard summary in academic reporting, and the chair will be familiar with comparing standard deviations across sections. Saying "Section A: mean 84.3, SD 8.6; Section B: mean 80.0, SD 16.2" makes it immediately clear that Section B has much more variability — some students are doing very well, others are struggling badly. The standard deviation surfaces the issue more visibly than the mean alone, which would have made the sections look almost identical. If the chair asks follow-up questions about which students need help, I would then look at the actual distribution, perhaps using the median and IQR as a robustness check. But for a one-line summary, mean ± SD is the right call.

Why This Is a Model Response

The student computes both standard deviation and IQR, and shows the computational steps for SD (deviations, squared deviations, sum, divide by n−1, square root). This is the procedure students need to internalize.

The student correctly uses n−1 (Bessel's correction) for the sample standard deviation. This is a small detail with a big effect on the answer at small sample sizes.

The comparison correctly observes that the centers are similar but the spreads differ dramatically. The same mean masking very different distributions is the entire reason measures of spread exist.

The recommendation is reasoned. The student does not just say "report the standard deviation" but explains why it is appropriate (familiar to the audience, surfaces the key difference between sections) and what they would do as a follow-up.

The pairing of mean with SD, and the implicit pairing of median with IQR, follows standard reporting conventions in published research. The student is learning the conventions, not just the computations.`,
  },
  {
    id: "e2",
    number: 4,
    title: "Essay 2: Visualizing Data",
    points: 50,
    type: "essay",
    objectives: [
      "Match histogram, boxplot, scatterplot, and bar chart to the data type and analytic question they best serve.",
      "Recognize and remediate common misleading visualization tricks (truncated axes, cherry-picked windows, etc.).",
    ],
    reading: `Background

Numbers in a table can hide structure that becomes obvious in a picture. The right visualization can reveal patterns, outliers, and relationships that no summary statistic captures. The wrong visualization — or no visualization at all — can mislead even careful analysts.

Four visualization types cover most of what a Statistics 101 student needs.

A HISTOGRAM displays the distribution of a single numerical variable. Values are sorted into bins (intervals), and the height of each bar shows how many observations fall in that bin. A histogram reveals the shape of the distribution: is it symmetric? Skewed? Bimodal? Are there outliers? Most importantly, it shows whether the data look approximately bell-shaped (normal) or some other shape, which determines what statistical methods are appropriate.

A BOXPLOT (also called a box-and-whisker plot) shows a five-number summary: minimum, first quartile, median, third quartile, and maximum. The box spans Q1 to Q3 (the IQR), with a line at the median. The "whiskers" extend to the smallest and largest values not classified as outliers. Outliers — typically defined as values more than 1.5 × IQR beyond the box — are plotted as individual points. Boxplots are excellent for comparing several groups side by side, because each group becomes a single compact figure.

A SCATTERPLOT displays the relationship between two numerical variables. Each observation is a point at coordinates (x, y). Scatterplots reveal whether two variables are correlated, whether the relationship is linear or curved, and whether outliers exist that distort overall patterns. Almost any analysis of "how does X relate to Y?" should start with a scatterplot.

A BAR CHART displays counts or summary statistics across categories. The horizontal axis lists categories (eye colors, treatment groups, countries); the vertical axis shows the count or value. Bar charts are the right choice for categorical data; histograms are the right choice for numerical data. Confusing the two is a common error — a histogram has touching bars (because the underlying variable is continuous), while a bar chart has gaps between bars (because the categories are distinct).

What each visualization reveals — and hides:
- A histogram reveals shape but hides individual values
- A boxplot reveals position and outliers but hides the shape between the quartiles (a uniform distribution and a bimodal distribution can produce similar boxplots)
- A scatterplot reveals relationships but, with very large datasets, points can overplot and hide local density
- A bar chart reveals counts but cannot show within-category variation

Best practice: when first encountering a dataset, plot it before computing anything. Statisticians sometimes call this "looking at the data," and it is the single most reliable way to avoid embarrassing analytic errors.`,
    assignment: `Assignment (50 points)

Section 1 (10 points) — Definitions
In your own words, describe what each of the four visualization types (histogram, boxplot, scatterplot, bar chart) shows and what kind of data each is appropriate for. Give one strength and one limitation of each.

Section 2 (20 points) — Choosing the Right Visualization
For each of the following situations, name the visualization you would use and explain why. Be specific: if there are multiple reasonable choices, argue for the one you think is best.

1. You have the heights, in inches, of 500 incoming college freshmen, and you want to know whether the distribution is approximately bell-shaped.
2. You have the SAT scores of students from 6 different high schools (about 100 students per school), and you want to compare the schools.
3. You have, for each of 80 cities, the population and the number of public libraries. You want to know whether bigger cities tend to have more libraries.
4. You have a survey of 1,000 voters, each of whom identified their preferred candidate (out of 5 candidates). You want to summarize voter preferences.

Section 3 (20 points) — Misleading Visualizations
Visualization can mislead as well as inform. Describe TWO specific tricks or mistakes that produce misleading visualizations. (Examples: truncated y-axes, inappropriate scale, choice of histogram bin width, cherry-picked time windows, 3D pie charts, dual y-axes, etc.) For each:
- Describe the trick or mistake
- Give a concrete example of where you have seen it (real or hypothetical)
- Explain what false impression the reader takes away
- Describe how you would redraw the visualization to be honest`,
    modelResponse: `Model Response

Section 1: Definitions

A HISTOGRAM displays the distribution of a single numerical variable by binning values into intervals and drawing a bar for each bin whose height shows the count or proportion. Strength: shows the SHAPE of the distribution clearly — symmetric, skewed, bimodal, etc. Limitation: the apparent shape depends on bin width; too few bins hide structure, too many bins obscure it with noise.

A BOXPLOT shows the five-number summary (min, Q1, median, Q3, max) plus outliers, in a compact format. Strength: ideal for side-by-side comparison of several groups; surfaces outliers automatically. Limitation: hides the shape of the distribution between the quartiles — a bimodal distribution with a gap at its median looks the same as a smooth distribution.

A SCATTERPLOT displays the relationship between two numerical variables, with each observation as a point. Strength: reveals correlation, linearity, and outliers in two-variable relationships. Limitation: overplotting in large datasets — thousands of points can pile on top of each other, hiding local density (countermeasures include transparency, jitter, or hexbin plots).

A BAR CHART shows counts or summary values across discrete categories. Strength: the natural choice for categorical data — clear, easy to read, hard to misinterpret when done well. Limitation: cannot show variation WITHIN categories; a bar showing "average revenue per region" hides whether some stores in that region wildly outperformed others.

Section 2: Choosing the Right Visualization

1. Heights of 500 freshmen, distribution shape: HISTOGRAM. Heights are a continuous numerical variable, the dataset is large, and the question is specifically about distribution shape. A histogram with an appropriate bin width (say, 1-inch bins) would show whether the data are approximately bell-shaped, skewed, or contain unexpected features. A boxplot would also work but would miss the sub-shape detail.

2. SAT scores at 6 high schools, comparing schools: BOXPLOTS, side by side. With 6 groups of 100 students each, side-by-side boxplots are the standard choice — one boxplot per school, arranged horizontally for direct visual comparison of medians, IQRs, and outliers. Six histograms would also work but would require six separate panels and make comparison harder. A bar chart of mean scores would hide the variation within each school, which is exactly what the comparison is about.

3. City population vs. number of libraries: SCATTERPLOT. Two numerical variables, one observation per city — that is the textbook scatterplot situation. With 80 points, overplotting is not a concern. The plot would reveal whether the relationship is linear, curved, or absent. As a follow-up, log-transforming both axes might be sensible if city populations span several orders of magnitude.

4. Voter preferences across 5 candidates from 1,000 voters: BAR CHART. Categorical data (which candidate), so a bar chart is the natural choice. Each candidate gets a bar showing how many voters chose them. A pie chart would technically work but is harder to compare than a bar chart, especially when several values are similar in magnitude.

Section 3: Misleading Visualizations

TRICK 1: Truncated y-axis.

Description: a bar chart whose y-axis does not start at zero. Small differences between bars are visually exaggerated because the visible portion of each bar is a small fraction of the total height, but the truncation makes them look proportionally large.

Concrete example: a chart of unemployment rates over four quarters showing values of 5.1%, 5.2%, 5.3%, 5.4%. The y-axis runs from 5.0% to 5.5%. Each bar is a different visible height, with the last bar appearing roughly four times as tall as the first.

False impression: unemployment has roughly quadrupled, when in fact it has risen by 0.3 percentage points (a 6% relative increase, but a tiny absolute change).

How to redraw honestly: y-axis starting at zero. The four bars would look essentially identical, accurately conveying that the change is small. If the small change really is the story, an annotation noting the absolute and relative size of the change would be more honest than visual exaggeration.

TRICK 2: Cherry-picked time window.

Description: showing data from a deliberately chosen short time period that supports a desired narrative, while ignoring the longer-term context that would tell a different story.

Concrete example: a stock chart showing a company's share price over the past three months, during which it has risen 30%. The chart's caption is "Strong growth!" Hidden from view: the previous nine months, during which the share price fell 50%. The three months shown are simply a partial recovery.

False impression: the stock is performing strongly, when in fact over a full-year period it is still well below where it started.

How to redraw honestly: show at least one full year of data, with a clear time axis. If the recent rebound really is the story, the longer timeframe should make that more impressive (or less, depending on context), and the reader can interpret it themselves rather than being shown only the part that supports a predetermined narrative.

Why This Is a Model Essay

Section 1 distinguishes a histogram from a bar chart correctly. This is a foundational distinction that beginning students often miss, and the model response notes the visual difference (touching bars vs. gapped bars).

Section 2 reasons through each choice rather than just naming a chart type. The student explains why a boxplot is better than a bar chart of means for school comparison: bars hide within-school variation, which is the whole point.

In Section 3, both tricks are described with specific scenarios (unemployment chart, stock chart) that match the kind of misleading visualizations students will actually encounter in journalism and advertising.

The "how to redraw honestly" step turns critique into prescription. It is not enough to recognize that something is misleading; the student should know how to present the same data in a defensible way.

The closing observation — that the reader should interpret the data themselves — captures the ethical core of data visualization. The job of a chart is to help understanding, not to enforce a conclusion.`,
  },
  {
    id: "d3",
    number: 5,
    title: "Discussion 3: Probability Basics",
    points: 50,
    type: "discussion",
    objectives: [
      "Apply independence, conditional probability, and base-rate reasoning to construct and solve probability problems.",
      "Recognize base-rate neglect and explain its consequences in real-world contexts such as medical testing.",
    ],
    reading: `Background

Probability is the language for talking about uncertain events. A probability is a number between 0 and 1: 0 means the event cannot happen, 1 means it certainly will, 0.5 means it is as likely to happen as not. Probabilities are often expressed as percentages (0.25 = 25%) or as fractions (1/4).

Three concepts cover most of what a Statistics 101 student needs to navigate.

INDEPENDENCE: two events are independent if the occurrence of one does not change the probability of the other. Successive coin flips are independent — getting heads on the first flip tells you nothing about the second. Drawing two cards from a deck WITHOUT replacement is NOT independent — once the first card is drawn, the deck has changed, so the probabilities for the second draw are different.

When two events A and B are independent:

P(A and B) = P(A) × P(B)

When they are not independent, the multiplication rule still holds but the second probability must be the conditional probability of B given that A has happened.

CONDITIONAL PROBABILITY: P(B | A) is read "the probability of B given A." It answers: "if A has happened, how likely is B?" This is the core concept for understanding many real-world questions. The probability of a randomly chosen American owning a car is high; the probability of a randomly chosen American who lives in Manhattan owning a car is much lower. The conditioning on Manhattan changes the population we are looking at.

P(B | A) = P(A and B) / P(A)

$$P(B \\mid A) = \\frac{P(A \\text{ and } B)}{P(A)}$$

BASE RATES: the prevalence of an event in the underlying population. If only 1% of people in a population have a disease, then "1%" is the base rate. Many famous probability puzzles arise from people ignoring base rates. If a test for the disease is 99% accurate but only 1% of people have the disease, what fraction of positive test results are actually correct? The intuitive answer (99%) is wildly wrong — see the model response below for the correct reasoning.

A note on language: probability has two interpretations that mostly agree but sometimes diverge.

Frequentist: a probability is the long-run frequency of an event in repeated trials. The probability of heads on a fair coin is 0.5 because, in many flips, half come up heads.

Bayesian: a probability is a degree of belief that can be updated as evidence accumulates. The probability that a particular suspect committed a crime is the strength of one's rational belief, given the evidence.

For most introductory purposes the two views give the same answers. For some applications — notably medical diagnostics and AI — the Bayesian view is essential.`,
    assignment: `Assignment (50 points)

Construct an original probability problem involving conditional probability or base-rate reasoning. The problem should involve at least two events whose probabilities you specify. Then:

1. State the problem clearly
2. Give the relevant probabilities
3. Compute the conditional probability or other quantity of interest, showing your steps
4. Explain in 2–3 sentences what your result means in plain language — what the answer reveals about the situation
5. Identify ONE common reasoning mistake that someone might make on this kind of problem`,
    modelResponse: `Model Response

Problem: a hypothetical city of 100,000 people is screening residents for a rare disease. The disease affects 1% of the population. The screening test is 95% accurate in two senses: 95% of people who have the disease test positive (sensitivity); 95% of people who do not have the disease test negative (specificity). A randomly chosen resident takes the test and tests positive. What is the probability that they actually have the disease?

Probabilities given:
- P(disease) = 0.01 (the base rate — 1% of the population has the disease)
- P(positive | disease) = 0.95 (sensitivity)
- P(negative | no disease) = 0.95 (specificity), which means P(positive | no disease) = 0.05 (the false positive rate)

Quantity of interest: P(disease | positive) — given that the test came back positive, what is the probability the person actually has the disease?

Reasoning by counting (often clearer than formula manipulation): imagine the entire population of 100,000 people. The expected counts are:
- 1,000 people have the disease (1% of 100,000)
- 99,000 people do not have the disease

Among the 1,000 with the disease, 95% will test positive: that is 950 true positives.
Among the 99,000 without the disease, 5% will test positive: that is 4,950 false positives.
Total positives expected: 950 + 4,950 = 5,900.

Of these 5,900 positives, 950 are actually sick and 4,950 are not. The probability that a positive test result corresponds to actual disease is:

P(disease | positive) = 950 / 5,900 ≈ 0.161

That is about 16.1%.

Plain-language interpretation: even though the test is 95% accurate, a positive result means the person is only about 16% likely to actually have the disease. The reason is the rarity of the disease itself: because so few people in the population have it, even a small false-positive rate generates more false positives than there are true positives. The test is helpful — it raises the probability from 1% (the base rate) to 16% — but a positive result is not by itself a diagnosis. This is why screening tests are typically followed by more specific confirmatory tests before any treatment is started.

Common reasoning mistake: many people see "95% accurate" and intuitively conclude that a positive test means a 95% chance of having the disease. This is base-rate neglect — ignoring how rare the disease is in the underlying population. The error has serious real-world consequences. Patients and even some physicians overestimate the meaning of positive screening results, leading to anxiety, unnecessary follow-up procedures, and sometimes treatment of people who are not actually sick. The correct reasoning has been called "Bayesian thinking": always start from the base rate, then update based on the evidence. The base rate is the anchor; the evidence shifts you, but it does not replace the anchor.

Why This Is a Model Response

The student uses the "imagine the whole population" reasoning method, which is more intuitive than algebraic manipulation of P(B|A) formulas and produces the same answer. This is the method recommended by Gerd Gigerenzer and others who study how people actually understand probability.

The student keeps track of both true positives and false positives separately. The key insight — that false positives can outnumber true positives when the base rate is low — is made visible in the counts.

The plain-language interpretation gives the result its real meaning. "About 16%" is the technical answer; "even though the test is 95% accurate, a positive result is not a diagnosis" is the takeaway that matters in practice.

The reasoning mistake (base-rate neglect) is named and tied to a real-world consequence. Real medical practice has had to develop confirmatory testing protocols precisely because base-rate neglect is so common.

The framing of "the base rate is the anchor" gives the student a heuristic they can carry into other problems: always ask what the prevalence is before interpreting test accuracy.`,
  },
  {
    id: "e3",
    number: 6,
    title: "Essay 3: The Normal Distribution and Z-Scores",
    points: 50,
    type: "essay",
    objectives: [
      "Apply the 68-95-99.7 empirical rule and z-score formula to a normally distributed variable.",
      "Use z-scores to compare values from different distributions and recognize when the normal-distribution assumption fails.",
    ],
    reading: `Background

Of all the probability distributions, the NORMAL DISTRIBUTION (sometimes called the bell curve or Gaussian distribution) is the most important. Three reasons:

1. Many natural quantities are approximately normally distributed: heights, weights, errors in measurement, IQ scores, blood pressure, exam scores in large classes.
2. The Central Limit Theorem (covered in Discussion 4) guarantees that even when the underlying data are NOT normal, sums and averages of large samples often are.
3. It has well-understood mathematical properties that make many statistical techniques straightforward.

A normal distribution is fully described by two numbers: its mean (μ) and its standard deviation (σ). The bell curve is centered at μ; its width is determined by σ. Larger σ means a wider, flatter bell; smaller σ means a narrower, taller bell. The total area under the curve always equals 1, since it represents 100% of the probability.

THE 68-95-99.7 RULE (also called the empirical rule). For any normal distribution:
- About 68% of the data falls within 1 standard deviation of the mean (μ ± σ)
- About 95% falls within 2 standard deviations (μ ± 2σ)
- About 99.7% falls within 3 standard deviations (μ ± 3σ)

This rule is worth memorizing. It lets you quickly judge whether a value is unusual: a measurement more than 2 standard deviations from the mean has only a 5% chance of occurring by chance alone if the data are normal; more than 3 standard deviations is very unusual indeed.

Z-SCORES standardize a value by expressing how many standard deviations it lies above or below the mean:

z = (x − μ) / σ

$$z = \\frac{x - \\mu}{\\sigma}$$

A z-score of 0 means the value equals the mean. A z-score of +1 means it is one standard deviation above the mean; −1 means one standard deviation below. Z-scores let you compare values from different distributions on the same scale: you can directly compare an SAT score (mean 1050, SD 200) to an ACT score (mean 21, SD 5) by converting both to z-scores.

Z-scores also let you look up probabilities in a standard normal table or with software: for any z-score, you can ask "what fraction of the data lies below this value?" or "what fraction lies above?" This is how percentiles are computed.`,
    assignment: `Assignment (50 points)

Section 1 (10 points) — The Empirical Rule
Suppose adult heights in a population are approximately normally distributed with mean μ = 68 inches and standard deviation σ = 3 inches. Using the 68-95-99.7 rule (no calculator needed):
1. What range of heights covers about 68% of adults?
2. What range covers about 95%?
3. Approximately what fraction of adults are taller than 74 inches?
4. Approximately what fraction are shorter than 62 inches?

Section 2 (20 points) — Z-Scores
Three students compare scores across different exams. Compute each student's z-score, and rank them by relative performance:
1. Alice scored 92 on a math final where the class mean was 78 and the class standard deviation was 8.
2. Bob scored 85 on a chemistry final where the class mean was 70 and the class standard deviation was 10.
3. Carmen scored 70 on a Spanish final where the class mean was 60 and the class standard deviation was 4.

Show your computation for each. Then explain in 2–3 sentences which student performed best relative to their class, and why z-scores are the right comparison metric here.

Section 3 (20 points) — A Real Application
Choose ONE real-world quantity that is approximately normally distributed. Describe:
- The variable and a plausible mean and standard deviation
- What a value at z = +2 would mean in concrete terms (a height? a test score? a wait time?)
- How an analyst could use the empirical rule to answer a practical question about this variable
- One way the normal-distribution assumption could be wrong, and what would happen if you used normal-based reasoning when the assumption fails`,
    modelResponse: `Model Response

Section 1: The Empirical Rule

Heights are normally distributed with μ = 68 inches, σ = 3 inches.

1. About 68% of adults fall within 1 SD of the mean: 68 − 3 = 65 to 68 + 3 = 71 inches. So about 68% of adults are between 65 and 71 inches tall.

2. About 95% fall within 2 SDs: 68 − 6 = 62 to 68 + 6 = 74 inches. So about 95% of adults are between 62 and 74 inches tall.

3. Heights above 74 inches are more than 2 SDs above the mean. By the empirical rule, about 95% are within 2 SDs, so about 5% are outside that range — split roughly equally between the two tails. About 2.5% of adults are taller than 74 inches.

4. Heights below 62 inches are more than 2 SDs below the mean. By the same reasoning, about 2.5% of adults are shorter than 62 inches.

Section 2: Z-Scores

Alice: z = (92 − 78) / 8 = 14 / 8 = 1.75. Alice is 1.75 SDs above her class mean.
Bob: z = (85 − 70) / 10 = 15 / 10 = 1.50. Bob is 1.5 SDs above his class mean.
Carmen: z = (70 − 60) / 4 = 10 / 4 = 2.50. Carmen is 2.5 SDs above her class mean.

Ranking by z-score (best relative performance first): Carmen (z = 2.50), Alice (z = 1.75), Bob (z = 1.50).

Carmen performed best relative to her class — even though her raw score (70) was lower than Alice's or Bob's, her score was farther above her class mean in standard deviations. Z-scores are the right metric here because the three exams have different means and different spreads. Comparing raw scores directly would be misleading: a 70 in a class with mean 60 and tight SD 4 represents much stronger relative performance than a 92 in a class with mean 78 and looser SD 8. Standardizing puts all three students on the same scale and lets us answer "how unusual is this score within its own class?" directly.

Section 3: A Real Application

Variable: SAT total scores in a recent national administration. Plausible mean μ ≈ 1050, plausible SD σ ≈ 200 (these are rough national averages; the exact numbers vary by year).

A z = +2 score means: 2 SDs above the mean, or 1050 + 2(200) = 1450. In concrete terms, an SAT score of 1450 would put a student at roughly the 97.5th percentile of test-takers — only about 2.5% of students nationally would score higher. This is the level commonly considered competitive for selective universities.

Practical use of the empirical rule: a college admissions officer reviewing a candidate with an SAT score of 1250 could quickly note that 1250 is one SD above the mean (1050 + 200 = 1250), placing the candidate at roughly the 84th percentile — top sixth of test-takers but not exceptional. Similarly, a 850 score is one SD below the mean, putting the candidate at roughly the 16th percentile. The empirical rule lets the officer make fast, calibrated comparisons across applicants without consulting percentile tables for every score.

How the assumption could fail: SAT scores are not perfectly normal. They are often slightly bimodal (because there are concentrations of well-prepared and less-prepared test-takers) and have a hard ceiling at 1600, which truncates the upper tail. If a score is very high (say, 1550), normal-distribution reasoning would estimate the percentile by looking at the corresponding z-score (z = (1550 − 1050)/200 = 2.5, or about 99.4th percentile). But because the actual distribution piles up at the ceiling — many students earn 1500–1600 — the true percentile of 1550 might be lower than 99.4% (perhaps 98% or 99%). The estimate is in the right ballpark but slightly inflated. For most analytic purposes the difference does not matter, but for very high scores or very low ones, the normal approximation can mislead.

Why This Is a Model Essay

The empirical rule is applied directly. The student does not detour through tables or software; the 68-95-99.7 numbers and a single subtraction give the answer. This shows the student understands the rule's purpose: fast, calibrated estimation.

The z-score interpretation in Section 2 explicitly addresses why standardization is needed when comparing across different distributions. The student sees that raw scores are misleading and z-scores fix the issue.

The Section 3 example uses real-ish SAT numbers, and the student notes both the strength of normal-based reasoning (quick percentile estimation) and its limits (truncation at the ceiling distorts very high scores).

The closing point — that even an imperfect normal approximation gives "right ballpark" estimates — is honest. Many real datasets are approximately, not exactly, normal, and a student who can name when the approximation is good and when it is not has internalized the right level of caution.

The student ranks the three students correctly and explains the ranking, rather than just listing the z-scores. The interpretation step is what separates a memorized formula from genuine understanding.`,
  },
  {
    id: "d4",
    number: 7,
    title: "Discussion 4: Sampling and the Central Limit Theorem",
    points: 50,
    type: "discussion",
    objectives: [
      "Distinguish representative from biased sampling strategies and identify common sampling pitfalls.",
      "Explain the Central Limit Theorem and why it permits inference from a sample even when the underlying data are not normally distributed.",
    ],
    reading: `Background

In real-world research we almost never have access to the entire POPULATION we want to study. We cannot poll every voter, weigh every fish in the lake, or measure every component coming off the assembly line. Instead, we collect a SAMPLE — a manageable subset — and use it to learn about the population.

Sampling raises two questions: how should we draw the sample so it represents the population, and how confident can we be in conclusions drawn from a sample?

REPRESENTATIVE SAMPLING means the sample resembles the population in the relevant respects. The gold standard is the SIMPLE RANDOM SAMPLE: every individual in the population has an equal chance of being selected. Random sampling does not guarantee a representative sample — by chance any single sample might miss certain groups — but in expectation, random samples are representative, and the deviations from representativeness are predictable and quantifiable.

Several common sampling errors produce non-representative samples:

Convenience sampling: surveying whoever happens to be available. Mall surveys reach the kind of people who go to malls during the times surveyors are there.

Self-selection bias: surveys posted online answered only by people who choose to respond. The 1936 Literary Digest poll famously predicted Alf Landon would beat Franklin Roosevelt by 57% to 43%; Roosevelt won 62% to 38%. The poll surveyed Literary Digest subscribers, telephone owners, and registered car owners — a wealthier slice of America than the actual electorate.

Voluntary response bias: studies that depend on people choosing to participate (online reviews, hotline call-ins) over-represent the highly motivated — usually people with strong negative or strong positive opinions.

Undercoverage: failing to reach segments of the population at all. Phone polls miss people without phones, online polls miss people without internet, daytime polls miss people who work during the day.

THE CENTRAL LIMIT THEOREM (CLT) is one of the most important results in statistics. It says, roughly:

Even if the underlying population is NOT normally distributed, the distribution of SAMPLE MEANS — across many samples of the same size — IS approximately normal, provided the sample size is large enough (typically n ≥ 30 is the rule of thumb, though some distributions need more).

Three implications follow:
- We can make inferences about the population mean using normal-distribution methods (z-scores, confidence intervals, hypothesis tests) even when the underlying data are skewed or have heavy tails
- Larger samples give more precise estimates of the population mean — the standard deviation of the sample mean is σ/√n, which shrinks as n grows
- The sample size matters more than the population size. A random sample of 1,000 voters gives roughly the same precision whether the population is 100,000 or 100,000,000

The CLT is why polls of just 1,000 to 2,000 people can predict national election results to within a few percentage points.`,
    assignment: `Assignment (50 points)

Choose ONE real or hypothetical research situation that requires sampling. (Examples: surveying student satisfaction at a university; estimating the mean weight of fish in a lake; testing average product defect rates from a factory; estimating average household water use in a city.) Then:

1. State the population you want to learn about and the variable you want to measure
2. Describe a sampling strategy you would use, and explain why it would tend to produce a representative sample
3. Identify TWO specific sampling pitfalls — concrete ways your strategy could go wrong — and what you would do to mitigate each
4. Explain in plain language why the Central Limit Theorem matters for your study, and how it would let you make inferences about the population mean even if the underlying data are not normally distributed`,
    modelResponse: `Model Response

Research situation: a regional health department wants to estimate the mean systolic blood pressure of adults in a county of 200,000 residents.

Population and variable: the population is all adults age 18 or older living in the county. The variable is systolic blood pressure (in mmHg) measured under standardized conditions.

Sampling strategy: a STRATIFIED RANDOM SAMPLE of 1,000 residents. The strata would be defined by age range (18–34, 35–54, 55–74, 75+) and by census tract, to ensure representation across the relevant subpopulations. Within each stratum, residents would be selected randomly from county records (voter rolls combined with utility billing addresses, which together cover essentially all adults). Selected individuals would be invited by mail and phone for a free blood pressure measurement at one of several mobile clinics rotating through neighborhoods.

Why this tends to be representative: stratification ensures the sample matches the population's composition by age and geography. Within strata, random selection avoids systematic biases. Because the population is finite (200,000) and sample size is reasonable (1,000), the central limit theorem applies and the estimated mean should be a precise estimate of the true county-wide mean.

Two specific pitfalls and mitigations:

Pitfall 1 — non-response bias. Some selected residents will decline to participate. If they decline at different rates than they would benefit from participating, the sample becomes unrepresentative. For example, people with high blood pressure might be more likely to decline if they fear what the measurement will reveal, or less likely to decline if they value the free screening. Either way, the sample mean would be biased relative to the true population mean.

Mitigation: track the response rate and the demographic composition of responders vs. non-responders. Follow up with non-responders through additional outreach (a second mailing, evening phone calls, in-home visits for selected non-responders). Compare the demographics of the actual responders to the population on observable characteristics (age, sex, geography); if they differ substantially, weight the responses to correct, or report results stratified by relevant variables.

Pitfall 2 — coverage bias. The combined frame of voter rolls plus utility billing might still miss certain populations: people who recently moved, undocumented immigrants, people in institutions (prisons, nursing homes), people experiencing homelessness. If health outcomes for these groups differ from the rest, the sample misses them.

Mitigation: identify the most likely under-covered groups in advance and add targeted outreach. For homeless populations, partner with shelters and street outreach workers; for institutional populations, work with the institutions to include their residents; for recent movers, supplement with newer address databases. Document explicitly which groups are excluded so the inferences from the data are properly scoped — a study that excludes prisoners should be reported as a study of community-dwelling adults, not all adults.

Why the Central Limit Theorem matters: blood pressure in the population is not normally distributed. The distribution is skewed — there is a long right tail of people with hypertension, and certain medical conditions or medications produce heavier-than-normal tails. If we needed the underlying data to be normal in order to apply standard statistical methods, we would be in trouble. But the CLT tells us that even with a skewed underlying distribution, the SAMPLE MEAN of n = 1,000 will itself be approximately normally distributed across many hypothetical samples of size 1,000 from this population. That means we can build a confidence interval around our estimate using normal-distribution methods, even though the raw blood pressure values are skewed. The CLT is what makes the inference work despite the messiness of the underlying data. Without it, we would either have to assume normality (badly wrong here) or use more complicated nonparametric methods. With it, a sample of 1,000 gives a precise, well-justified estimate of the county mean.

Why This Is a Model Response

The student chooses STRATIFIED random sampling, not just simple random sampling. For populations with meaningful subgroups (age, geography), stratification produces more precise estimates and protects against accidentally missing a group. The student understands when to choose which method.

The two pitfalls (non-response, undercoverage) are the two most common sources of bias in survey research, and they are addressed with concrete mitigations rather than vague "be careful" advice.

The mitigation for non-response includes weighting — a real statistical technique used in actual surveys. The student is not making up methods; they are using methods statistical agencies actually use.

The CLT explanation correctly identifies that the underlying blood pressure data are skewed and explains that the CLT is about the distribution of the SAMPLE MEAN, not the raw data. This distinction is critical and frequently confused.

The closing observation that the CLT is "what makes the inference work despite the messiness of the underlying data" gets at the deep importance of the theorem. Without the CLT, applied statistics would look very different — and much more limited.`,
  },
  {
    id: "e4",
    number: 8,
    title: "Essay 4: Confidence Intervals",
    points: 50,
    type: "essay",
    objectives: [
      "Compute a confidence interval for a population mean and describe how sample size and confidence level affect its width.",
      "Identify and correct common misinterpretations of confidence intervals.",
    ],
    reading: `Background

A SAMPLE STATISTIC (the sample mean, the sample proportion) is a single number — a POINT ESTIMATE of an unknown population parameter. But a single number does not convey how precise the estimate is. If two pollsters each estimate that 52% of voters favor Candidate A, but one polled 100 people and the other polled 10,000, their estimates have very different precision. We need a way to communicate that.

A CONFIDENCE INTERVAL is a range of plausible values for the population parameter, calculated from the sample. A typical 95% confidence interval might be reported as:

   "Mean household income: $58,000 (95% CI: $55,200 to $60,800)"

The interpretation is more subtle than students often realize, and getting it exactly right is one of the most common Statistics 101 stumbles.

STRUCTURE OF A CONFIDENCE INTERVAL. For estimating a population mean using a large sample:

CI = x̄ ± z* · (s / √n)

$$\\text{CI} = \\bar{x} \\pm z^{*} \\cdot \\frac{s}{\\sqrt{n}}$$

Here:
- x̄ is the sample mean
- s is the sample standard deviation
- n is the sample size
- z* is the critical value from the normal distribution corresponding to the desired confidence level (about 1.96 for 95%, about 2.58 for 99%)
- The quantity s / √n is called the standard error — the typical "noise" in the sample mean
- The interval gets WIDER when you increase confidence (95% to 99%), and NARROWER when you increase sample size. Larger samples give more precise estimates.

CORRECT INTERPRETATION. A 95% confidence interval means: if we repeated the sampling procedure many times and constructed an interval each time, about 95% of those intervals would contain the true population parameter. The "95%" describes the long-run reliability of the PROCEDURE, not the probability that any particular interval is correct.

A subtle but important point: once we have computed a specific interval, the population parameter either is or is not inside it. The 95% does not mean "there is a 95% chance the true mean is between $55,200 and $60,800." Frequentist statisticians insist on this distinction. (Bayesian credible intervals can be interpreted that way, but they are computed differently.)

In practice, working scientists often DO speak loosely as if "95% chance the true value is in the interval," and for most purposes this loose interpretation is harmless. But for a Statistics 101 student, the technically correct interpretation is what gets credit on exams.

COMMON ERRORS in interpreting confidence intervals:

"The confidence interval contains 95% of the data." Wrong. It contains plausible values for the parameter, not a fraction of the data points.

"There is a 95% probability the true mean is in this interval." Technically wrong (frequentist), although harmless in practice.

"If I take another sample, 95% of the new sample data will fall in this interval." Wrong. The interval is about the PARAMETER, not future data.

"Wider intervals are better because they include more possibilities." Wrong. Wider intervals reflect MORE uncertainty, not better inference. We want intervals that are as narrow as possible at the desired confidence level.`,
    assignment: `Assignment (50 points)

Section 1 (10 points) — Computing a Confidence Interval
A random sample of 100 students at a university yields a mean GPA of 3.1 with sample standard deviation 0.5. Compute the 95% confidence interval for the mean GPA of all students at the university. Show your work step by step. Then state what your interval tells you, in plain language.

Section 2 (20 points) — Effect of Sample Size and Confidence Level
Using the same data (sample mean 3.1, sample SD 0.5):
1. Recompute the confidence interval at the 99% level. Compare it to the 95% interval. Which is wider, and why?
2. Recompute the 95% interval if the sample had been n = 25 instead of n = 100. Compare to the original. Which is wider, and why?
3. Recompute the 95% interval if the sample had been n = 400. Compare to the original. Which is narrower, and how does the relationship between sample size and interval width work?

Section 3 (20 points) — Interpretation Errors
Identify TWO common errors in interpreting confidence intervals (you may use any two, including but not limited to those listed in the background). For each:
- State the incorrect interpretation
- Explain why it is wrong
- State the correct interpretation
- Give a concrete situation where the wrong interpretation would lead someone to a bad decision`,
    modelResponse: `Model Response

Section 1: Computing a 95% Confidence Interval

Given: x̄ = 3.1, s = 0.5, n = 100. The 95% z-value is z* = 1.96.

Standard error:
SE = s / √n = 0.5 / √100 = 0.5 / 10 = 0.05

Margin of error:
ME = z* · SE = 1.96 · 0.05 = 0.098

Confidence interval:
CI = x̄ ± ME = 3.1 ± 0.098 = (3.002, 3.198)

Plain-language interpretation: based on this sample, our best estimate of the mean GPA at the university is 3.1, and the true population mean is plausibly somewhere between 3.00 and 3.20. If we had repeated the sampling procedure many times, about 95% of the resulting intervals would contain the true mean GPA. The narrow width of about 0.2 reflects the moderately large sample size; with only n = 100, we have decent — but not extremely tight — precision.

Section 2: Effect of Sample Size and Confidence Level

1. 99% interval with n = 100. The critical value at 99% is z* ≈ 2.58.
ME_99 = 2.58 · 0.05 = 0.129
CI_99 = 3.1 ± 0.129 = (2.971, 3.229)

The 99% interval is wider than the 95% interval (width 0.258 vs. 0.196). This is intuitive: to be MORE confident that the interval contains the true mean, we have to include a wider range of plausible values. Higher confidence = wider interval, holding sample size fixed.

2. 95% interval with n = 25. Standard error grows as the sample shrinks:
SE = 0.5 / √25 = 0.5 / 5 = 0.10
ME = 1.96 · 0.10 = 0.196
CI = 3.1 ± 0.196 = (2.904, 3.296)

This interval is roughly twice as wide as the original (width 0.392 vs. 0.196). With only n = 25, we have much less precise information about the population mean — the standard error is twice as large.

3. 95% interval with n = 400.
SE = 0.5 / √400 = 0.5 / 20 = 0.025
ME = 1.96 · 0.025 = 0.049
CI = 3.1 ± 0.049 = (3.051, 3.149)

This interval is roughly half as wide as the original (width 0.098 vs. 0.196). The relationship: interval width is proportional to 1/√n. To halve the interval width, you need to QUADRUPLE the sample size. This is why studies aiming for high precision require so many participants — the diminishing returns kick in quickly.

Section 3: Two Common Interpretation Errors

ERROR 1: "There is a 95% probability that the true mean GPA is between 3.00 and 3.20."

Why it is wrong: this interpretation treats the population mean as a random variable that has some probability of being in our specific interval. In frequentist statistics, the population mean is a fixed (though unknown) number — it is either in our interval or not. The "95%" describes the reliability of the PROCEDURE for generating intervals across many repetitions, not a probability about this particular interval.

The correct interpretation: 95% of the intervals constructed by this procedure (over many samples) would contain the true mean. For our specific interval (3.00, 3.20), we cannot say more — either it contains the true mean or it does not.

A bad-decision scenario: a researcher publishes a paper claiming "we are 95% certain that the mean tumor reduction is between 8% and 12%." A skeptic challenges that this is overconfident — "you cannot put a probability on a fixed parameter." The researcher dismisses this as pedantic. But a Bayesian re-analysis using a reasonable prior might give a credible interval of (5%, 15%), reflecting more genuine uncertainty than the confidence interval suggests. Conflating the two interval types can lead to overconfidence in published results.

ERROR 2: "If I take another random sample of 100 students, 95% of the new GPA values will fall between 3.00 and 3.20."

Why it is wrong: this confuses an interval for the POPULATION MEAN with an interval for FUTURE INDIVIDUAL OBSERVATIONS. The confidence interval is about the parameter, not future data points. Future GPAs in a sample of 100 will have spread close to the original sample SD (about 0.5), so most of them will fall well outside (3.00, 3.20).

The correct interpretation: the interval (3.00, 3.20) is a range of plausible values for the AVERAGE GPA across all university students. Individual student GPAs will scatter much more widely.

A bad-decision scenario: a university administrator looks at the confidence interval (3.00, 3.20) and concludes that almost no students at the school have GPAs below 3.0 or above 3.2. They proceed to set graduation honors thresholds based on this assumption. But the actual GPA distribution has SD = 0.5, so substantial fractions of students fall in the 2.5–3.0 range and the 3.2–3.7 range — exactly where the honors thresholds matter most. The administrator has confused the precision of the MEAN estimate with the spread of the actual data.

Why This Is a Model Essay

Section 1 shows the calculation step by step (sample SE, then ME, then CI), which is the format that scoring rubrics expect. The student does not skip steps even though the arithmetic is easy.

Section 2 builds intuition about the trade-offs. The student names the key relationship: interval width is proportional to 1/√n. This is the relationship that explains why studies need so many participants for small effects.

The point that "to halve the width, quadruple the sample" is exactly what study designers must internalize. It is the answer to "why is your sample so big?" in any consequential study.

Section 3 distinguishes two genuinely different errors — one about the meaning of probability, one about confusing parameter intervals with prediction intervals. Both are common; both have real consequences.

The bad-decision scenarios are concrete and plausible. The honors-threshold example shows that confusing parameter precision with data spread can lead to actively wrong policy choices, not just academic confusion.`,
  },
  {
    id: "d5",
    number: 9,
    title: "Discussion 5: Hypothesis Testing",
    points: 50,
    type: "discussion",
    objectives: [
      "State a null and alternative hypothesis, choose a significance level, and describe what data would lead to rejecting the null.",
      "Distinguish Type I from Type II errors and identify what evidence beyond the p-value matters before drawing a substantive conclusion.",
    ],
    reading: `Background

Hypothesis testing is the framework statisticians use to decide whether observed data provide evidence against a default assumption. It is the statistical foundation for almost every claim of "we found that..." or "this drug works..." or "this difference is statistically significant."

THE BASIC STRUCTURE. A hypothesis test proceeds in five steps:

1. Specify the NULL HYPOTHESIS (H₀). This is the default, "nothing is happening" claim — typically that there is no effect, no difference, no relationship. Examples: "the new drug has no effect on blood pressure"; "the coin is fair"; "the two groups have the same mean."

2. Specify the ALTERNATIVE HYPOTHESIS (H₁ or Hₐ). This is the claim we are testing FOR — typically that there IS an effect or difference. Examples: "the drug lowers blood pressure"; "the coin is biased toward heads"; "the two groups have different means."

3. Choose a SIGNIFICANCE LEVEL (α). This is the probability of rejecting the null hypothesis when it is actually true — the false-alarm rate we are willing to tolerate. Conventional choices are α = 0.05 (5%) and α = 0.01 (1%).

4. Compute the relevant TEST STATISTIC and the corresponding P-VALUE. The p-value is the probability of observing data as extreme as ours, OR MORE EXTREME, IF the null hypothesis were true.

5. Compare p to α. If p ≤ α, we REJECT the null hypothesis (the data are too unusual to be explained by chance under H₀). If p > α, we FAIL TO REJECT H₀ (the data are consistent with the null and we have not gathered enough evidence to overturn it).

TWO KINDS OF ERRORS. No statistical test is perfect; we always face two types of error:

TYPE I ERROR (false positive): rejecting H₀ when it is actually true. The probability of this is α.

TYPE II ERROR (false negative): failing to reject H₀ when it is actually false (the alternative is real). The probability of this is denoted β. The complement, 1 − β, is called the POWER of the test — the probability of correctly detecting a real effect.

Type I and Type II error rates trade off against each other for fixed sample size. Lowering α (being stricter about false alarms) raises β (we will miss more real effects). Increasing the sample size lets us reduce both at once.

WHAT THE P-VALUE DOES NOT MEAN.
- It is NOT the probability that the null hypothesis is true. The p-value assumes H₀ is true and asks how unusual the data are.
- It is NOT the probability that the result is due to chance.
- A p-value of 0.04 is NOT "weakly statistically significant"; the data either pass the threshold or they do not.
- STATISTICAL significance is not the same as PRACTICAL significance. A study with a huge sample size can achieve p < 0.001 for an effect so small it has no real-world importance.

The American Statistical Association issued a formal statement in 2016 cautioning researchers against over-reliance on p-values. Modern best practice supplements p-values with effect sizes, confidence intervals, and replication.`,
    assignment: `Assignment (50 points)

Construct an original hypothesis-testing scenario. (Examples: testing whether a new teaching method improves test scores; testing whether a coin is fair; testing whether men and women in a sample have different mean salaries; testing whether a drug reduces a symptom.) Then:

1. State the null and alternative hypotheses clearly
2. State your significance level α and explain why this choice is appropriate for your scenario
3. Describe what the data would have to show to lead you to reject H₀
4. Identify the consequences of a Type I error and a Type II error in your scenario, and discuss which is worse
5. Discuss what additional information beyond the p-value you would want to know before drawing a substantive conclusion`,
    modelResponse: `Model Response

Scenario: a school district is considering adopting a new mathematics curriculum that the publisher claims improves student test scores. To evaluate this claim, the district randomly assigns 40 classrooms to the new curriculum and 40 classrooms to the existing curriculum, and compares the mean end-of-year test scores in the two groups.

Hypotheses:

H₀: the population mean test score is the same under both curricula. In symbols: μ_new = μ_old, or equivalently μ_new − μ_old = 0.

H₁: the new curriculum produces a higher mean test score: μ_new > μ_old.

This is a one-sided test, because the question of interest is specifically whether the new curriculum is BETTER (we would not adopt it if it were significantly worse, but the question being asked is whether it is an improvement). A two-sided test (μ_new ≠ μ_old) would also be defensible and more conservative.

Significance level: α = 0.05. This is the conventional choice for educational research and matches what publishers and school boards expect to see. If the consequences of a wrong decision were more severe (a billion-dollar curriculum rollout, or a medical treatment), I would consider α = 0.01.

What data would lead to rejecting H₀: I would compute the difference in mean scores between the two groups and the corresponding test statistic (a two-sample t-statistic, given the sample sizes are moderate). If the resulting p-value is ≤ 0.05, I would reject H₀ and conclude that the new curriculum produces a statistically significant improvement. Concretely: with 40 classrooms per group, a difference of 5 points or more (out of 100) on a test where within-group SD is around 12 would be likely to produce p < 0.05. Smaller differences would not.

Type I and Type II error consequences:

TYPE I ERROR (false positive): we conclude the new curriculum is better when it actually is not. The district adopts the new curriculum based on noise. Costs: training all teachers, buying new materials, disrupting classroom routines, with no actual improvement in student outcomes. Possibly some real harm if the new curriculum has unmeasured downsides.

TYPE II ERROR (false negative): we fail to detect a real improvement and stick with the existing curriculum. Cost: students continue to learn from the inferior curriculum for at least another year, possibly indefinitely if the decision is not revisited.

Which is worse: in this case, I think Type II is worse. The Type I cost is one cycle of disruption; the Type II cost is real educational harm to students that compounds over time. This argues for using a higher α (more willing to accept some false positives) or, better, a larger sample size (more classrooms, allowing both error rates to be lower at once). However, it depends on the magnitude of cost: a $10 million rollout cost is non-trivial, and Type I might be more politically damaging because the wasted spending is highly visible while the foregone improvement (Type II) is invisible.

What additional information I would want beyond the p-value:

EFFECT SIZE: not just whether p < 0.05, but how big the improvement actually is. A difference of 1 point in test scores is statistically detectable with a large enough sample but practically negligible. A difference of 10 points might warrant adoption.

CONFIDENCE INTERVAL on the difference of means: a 95% CI gives a sense of the uncertainty in our point estimate. "5-point improvement (95% CI: 1 to 9)" tells me the effect is uncertainly small to moderate; "5-point improvement (95% CI: 4 to 6)" tells me the effect is precisely estimated and definitely meaningful.

REPLICATION: has this curriculum been tested in other districts, with similar results? A single positive study at p = 0.04 in one district is much weaker evidence than three studies showing similar effects in different districts.

SUBGROUP ANALYSIS: does the improvement hold equally across grade levels, demographic groups, prior-achievement quartiles? A curriculum that helps high-performing students but hurts struggling ones is not the same kind of "improvement" as one that helps everyone.

IMPLEMENTATION FIDELITY: did teachers actually follow the new curriculum, or did some quietly stick with the old one? A statistically significant improvement under perfect implementation might disappear under realistic conditions.

In short: p < 0.05 is necessary but far from sufficient for adopting a new curriculum. Effect size, uncertainty, replication, and real-world generalizability matter more than crossing the threshold.

Why This Is a Model Response

The student frames the test correctly: a one-sided test is justified by the substantive question (is the new curriculum BETTER), and the more conservative two-sided alternative is acknowledged.

The choice of α is justified rather than copied. The student notes that α = 0.05 is conventional but discusses when stricter standards would be appropriate.

The Type I vs. Type II discussion considers both kinds of cost (training spending vs. educational harm) and reaches a defensible judgment about which is worse, including political vs. substantive considerations.

The "what beyond p-value" section is the heart of the response. The American Statistical Association's 2016 statement is reflected here: effect size, confidence intervals, replication, subgroup effects, and implementation fidelity all matter. A student who can list these has graduated from "p < 0.05 means it works."

The closing line — "p < 0.05 is necessary but far from sufficient" — is the lesson the field is trying to teach since the replication crisis. Carrying it into school district decision-making is exactly how Statistics 101 is supposed to translate to applied judgment.`,
  },
  {
    id: "e5",
    number: 10,
    title: "Essay 5: Correlation vs. Causation",
    points: 50,
    type: "essay",
    objectives: [
      "Interpret the correlation coefficient r and explain why correlation alone does not establish causation.",
      "Identify the four common alternative explanations for a correlation (chance, reverse causation, confounding, selection) and design studies that rule them out.",
    ],
    reading: `Background

Two variables are CORRELATED when they tend to move together. The CORRELATION COEFFICIENT, denoted r, measures the strength and direction of the linear relationship:
- r ranges from −1 to +1
- r = +1: perfect positive linear relationship (when X goes up, Y always goes up)
- r = 0: no linear relationship
- r = −1: perfect negative linear relationship (when X goes up, Y always goes down)
- Values like 0.7 indicate strong correlations; 0.3 are moderate; 0.1 are weak

Correlation describes a pattern in observed data. CAUSATION, by contrast, claims that one variable INFLUENCES the other — that changing X would actually change Y. Correlation can be (and often is) observed without any causal relationship. The collapse from "X and Y are correlated" to "X causes Y" is one of the most common errors in data interpretation.

There are at least four reasons two variables might be correlated even if neither causes the other:

1. CHANCE. With enough variables and enough observations, some pairs will be correlated purely by accident. A famous example: the per-capita consumption of mozzarella cheese in the US correlates strongly with the number of civil engineering doctorates awarded each year, over a period of about a decade. The correlation is real; the causation is nonexistent.

2. REVERSE CAUSATION. The arrow runs the other way. People who exercise more tend to have better mental health (the correlation is real), but does exercise cause better mental health, or does better mental health enable people to exercise? Probably both, but observational correlation alone cannot tell you which direction is dominant.

3. CONFOUNDING VARIABLE. A third variable causes both. Ice cream sales and drowning deaths are correlated. Eating ice cream does not cause drowning; rather, hot weather causes both — more ice cream is sold in summer, and more people swim and risk drowning in summer. The third variable (weather) confounds the apparent relationship.

4. SELECTION EFFECTS. The way the data were collected creates a spurious relationship. If you study only patients who showed up at a hospital, you may find that two diseases are negatively correlated — but in the broader population, they may be unrelated. The selection (showing up at the hospital) creates the apparent pattern.

Establishing CAUSATION rigorously requires more than correlation. The gold standard is the RANDOMIZED CONTROLLED TRIAL: randomly assign treatment vs. control, observe the difference. Random assignment breaks all the alternative explanations — random groups are equivalent in expectation, so any difference in outcomes can be attributed to the treatment.

When randomization is impossible (because of cost, time, or ethics), researchers use various techniques to approximate it: natural experiments, instrumental variables, regression discontinuity designs, propensity score matching, longitudinal data with careful confounder adjustment. None of these fully solves the problem; all of them attempt to rule out the four alternative explanations above.`,
    assignment: `Assignment (50 points)

Section 1 (10 points) — Definitions and the Correlation Coefficient
In your own words, define correlation and the correlation coefficient r. Explain what r = +0.8, r = 0.0, and r = −0.5 each mean in plain terms. Then state in 2–3 sentences why correlation is not enough to establish causation.

Section 2 (20 points) — A Spurious Correlation Analyzed
Choose ONE famous spurious correlation (you can use one of the textbook examples — ice cream and drowning, divorce rates and margarine consumption, autism and organic food sales — or invent your own that is plausible). For your chosen correlation:
- State the two variables and the apparent relationship
- Identify which of the four explanations (chance, reverse causation, confounding, selection) accounts for the correlation
- Explain how a researcher could investigate further to confirm that the relationship is non-causal
- Describe how this kind of mistake plays out in real journalism or public discourse, with a concrete example if you can

Section 3 (20 points) — A Causal Question Designed Properly
Choose ONE substantive causal question — does daily meditation reduce anxiety? does a minimum wage increase reduce employment? does a particular textbook improve learning? does eating breakfast improve job performance? Then describe:
- Why a simple correlational study would be insufficient to answer it
- What confounding variables are most likely to interfere
- What study design would more credibly establish causation, and why
- What practical or ethical obstacles might prevent the ideal design from being run`,
    modelResponse: `Model Response

Section 1: Definitions

CORRELATION measures how two numerical variables move together. Two variables are positively correlated when high values of one tend to occur with high values of the other (and low with low); negatively correlated when high values of one occur with low values of the other; uncorrelated when there is no consistent pattern.

THE CORRELATION COEFFICIENT r is a number between −1 and +1 that measures the strength and direction of the LINEAR relationship between two variables.

r = +0.8 means a strong positive linear relationship — knowing one variable lets you predict the other reasonably well, and they generally move in the same direction.

r = 0.0 means no linear relationship — the variables are linearly independent. (Note: they could still have a non-linear relationship that r misses entirely.)

r = −0.5 means a moderate negative linear relationship — when one goes up, the other tends to go down, but the relationship has noticeable scatter.

Why correlation is not enough for causation: a correlation is a statistical pattern in observed data. It tells you that two variables are associated. It does NOT tell you whether one influences the other, whether the relationship is reverse causal, or whether some third variable causes both. Without ruling out these alternatives, claiming causation from correlation is unjustified.

Section 2: A Spurious Correlation — Ice Cream Sales and Drownings

The two variables: monthly ice cream sales in a region and monthly drowning deaths in that region. The correlation is strongly positive — months with high ice cream sales tend to have high drowning rates.

Which explanation accounts for the correlation: CONFOUNDING. The third variable is summer weather. Hot weather causes more ice cream sales (people seek cold treats) AND more drownings (more people go swimming, boating, and visiting beaches; rivers are full from spring runoff; pools are open). Neither variable causes the other; both are caused by the same underlying seasonal factor.

How to investigate further: a researcher could control for the confounding variable. Methods:
- Compute the correlation BY SEASON. Within winter months only, is there still a relationship? Within summer months only? If the correlation disappears when you condition on season, that is strong evidence the season was the confounder.
- Compute the partial correlation, statistically adjusting for temperature. If the residual correlation after removing the temperature effect is near zero, the original correlation was driven by temperature.
- Look at fine-grained time data. Within a single hot day, do hours of higher ice cream sales also have higher drownings? They should not — drownings are not generally happening during purchase hours.

How this plays out in journalism: reports that conflate correlation with causation are everywhere. A 2009 example: a study found that children who ate breakfast had better grades. Headlines: "Breakfast boosts grades." The actual causal story is far more complicated — children who eat breakfast tend to come from families with more resources, more stable home schedules, and more parental involvement, all of which independently affect grades. A randomized intervention that just provides breakfast (as some school programs do) shows much smaller effects on grades than the observational correlation suggested. The correlation was real; the causal interpretation was wrong; the policy implication was overblown.

Section 3: A Causal Question — Does Meditation Reduce Anxiety?

Why a simple correlational study would be insufficient: many studies have found that people who meditate regularly report lower anxiety levels than people who do not. But this correlation is open to all four alternative explanations:
- Reverse causation: people with low baseline anxiety might be more able to maintain a meditation practice; high-anxiety people might have started meditating but quit because their anxiety made it difficult
- Confounding: people who meditate often also exercise, eat healthier, sleep better, have higher socioeconomic status, and have more leisure time — all of which independently reduce anxiety
- Selection: meditation studies often recruit through ads in wellness magazines, so the participants are already pro-wellness; their experiences may not generalize
- Chance is a smaller concern given the consistency across studies, but individual studies could still be flukes

Most likely confounders: socioeconomic status (more leisure time, less work stress, better access to mental health resources), exercise, sleep quality, social connectedness, and prior mental health (people who already manage their mental health well are more likely to stick with meditation programs).

A study design that would more credibly establish causation: a randomized controlled trial. Recruit a population of adults reporting moderate anxiety. Randomly assign half to a structured meditation program (eight weeks of mindfulness training) and half to a control activity matched in time and group structure (such as a journaling program or a stretching program). Measure anxiety at baseline and at follow-up using validated scales. Random assignment ensures the two groups are equivalent in expectation on all the confounders — those who would have meditated and those who would not, distributed evenly across both arms. Any post-treatment difference can plausibly be attributed to the meditation itself.

Practical and ethical obstacles:
- Blinding: participants know whether they are in the meditation group, so placebo effects could inflate the meditation arm. Ideally we would also have an "active control" condition that mimics meditation's structure without its specific content (like the journaling/stretching example), but designing a perfect placebo for meditation is hard.
- Dropout: if anxious participants struggle to maintain the meditation practice, they may drop out, leaving a non-random subset in the analysis. Intent-to-treat analysis (analyzing all randomized participants regardless of compliance) helps but does not fully solve this.
- Generalizability: the participants who consent to a meditation RCT are probably more open to meditation than the general population. Effects in the population at large may be smaller.
- Cost and time: an eight-week trial with substantial follow-up is expensive. Long-term effects (does meditation still help two years later?) require longer follow-up.

In practice, the field of meditation research has produced multiple RCTs, and the evidence does suggest a moderate causal effect of meditation on anxiety — smaller than the observational studies implied, but real. This is exactly the pattern we would expect: observational correlations tend to overstate effects because they include all the confounders; RCTs, by removing confounders, find the actual causal contribution alone.

Why This Is a Model Essay

The Section 1 distinction includes the important footnote about r and non-linear relationships: r = 0 does NOT mean "no relationship," only "no LINEAR relationship." Beginning students often miss this.

In Section 2, the student does not just identify confounding but proposes specific ways to test the confounding hypothesis (within-season analysis, partial correlation, fine-grained time data). This is what real researchers do.

The breakfast-and-grades journalism example is current and shows the corrosive effect of bad statistics on policy: school meal programs are real, expensive, and worth getting right.

The Section 3 design names which confounders are likely (socioeconomic status, exercise, sleep) and the standard solution (RCT). It also notes specific obstacles to the ideal design — blinding, dropout, generalizability — which are exactly the issues that meditation researchers actually grapple with.

The closing observation that "RCTs find smaller effects than observational studies, because they remove confounders" captures a deep regularity in applied research. Students who internalize this will not be surprised when "exciting observational finding" fails to replicate in RCT.`,
  },
  {
    id: "d6",
    number: 11,
    title: "Discussion 6: Common Misuses of Statistics",
    points: 50,
    type: "discussion",
    objectives: [
      "Recognize common misuses of statistics — cherry-picking, p-hacking, Simpson's paradox, base-rate neglect, survivorship bias, and others.",
      "Identify red flags that signal each misuse and explain what a correct analysis would conclude instead.",
    ],
    reading: `Background

Statistics is a powerful tool, and like any powerful tool it is regularly misused — sometimes deliberately to deceive, more often through honest carelessness. A statistically literate person should be able to recognize the standard misuses and explain why they are wrong.

CHERRY-PICKING. Selecting only the data that support a desired conclusion while ignoring data that do not. A company touts "customers love us!" by quoting only five-star reviews, ignoring the one-star reviews. A weight-loss program advertises "average customer loses 15 pounds" by averaging only the customers who completed the program, ignoring dropouts.

P-HACKING. Running many statistical tests on the same dataset until something turns up significant by chance, then reporting only that one. With α = 0.05, you expect 1 in 20 tests to be "significant" by chance alone even if there is no real effect. A researcher who runs 20 different analyses and reports only the one that crossed p < 0.05 is essentially guaranteed to find a "result," but it is meaningless. P-hacking is the leading cause of failed replications in psychology and biomedical research.

SIMPSON'S PARADOX. A trend that appears in several different groups REVERSES when the groups are combined. A famous example: in 1973, UC Berkeley's admissions data appeared to show that women were admitted at a lower rate than men. But within each individual department, women were admitted at the same rate or higher. The aggregate appearance of bias was caused by the fact that women were applying in larger numbers to more competitive departments. Aggregating across departments produced the misleading overall pattern.

BASE-RATE NEGLECT. Already covered in Discussion 3. Ignoring the prevalence of an event in the underlying population leads to over-reaction to test results, court cases, and screening data.

CORRELATION MISTAKEN FOR CAUSATION. Already covered in Essay 5.

SURVIVORSHIP BIAS. Drawing conclusions from a sample that systematically excludes failures. A famous historical example: Abraham Wald, a statistician working for the U.S. military in World War II, was asked where to add armor to bombers. The military had data on returning bombers showing where they had been hit most often — wings, tail, fuselage. The natural inference was to add armor in those places. Wald pointed out that this was exactly backwards: those were the places where a bomber could be hit and STILL RETURN. The places where returning bombers were rarely hit (engines, cockpit) were the places where bombers that were hit DID NOT RETURN. The armor should go where the data showed no damage.

MISLEADING AVERAGES. Reporting a mean when a median would be more representative (or vice versa). Already discussed in Essay 1.

SMALL SAMPLE TROPHIES. Treating a single positive result from a small sample as definitive. With small samples, both Type I and Type II error rates are high, and reported effect sizes tend to be inflated (because small samples that did NOT show effects rarely get published).`,
    assignment: `Assignment (50 points)

Choose TWO of the misuses described above. (You may also use other well-documented misuses, such as misleading visualizations from Essay 2 or the Literary Digest sampling failure from Discussion 4.) For EACH misuse:

1. Briefly explain the misuse
2. Give a concrete example — real or constructed — that illustrates it. The example should be specific enough that a reader could follow the logic
3. Explain what the misled reader's incorrect conclusion would be
4. Explain what a correct analysis would conclude instead
5. Explain how a reader could spot this misuse in the wild — what red flags should they watch for`,
    modelResponse: `Model Response

Misuse 1: P-Hacking

Brief explanation: p-hacking is the practice of running many analyses on the same dataset until a "statistically significant" result appears by chance, then reporting only that result. With a conventional α = 0.05, about 1 in 20 tests will show p < 0.05 even when there is no real effect. A researcher who runs 20 tests and reports the one that crossed the threshold is reporting noise as if it were signal.

Concrete example: a researcher has data on 50 patients in a clinical trial of a new antidepressant. The pre-registered primary outcome is depression scores at 12 weeks; the difference between the drug group and placebo group is non-significant (p = 0.18). Disappointed, the researcher then tests:
- Sub-scores within the depression scale (5 sub-scales)
- Different time points (4, 8, 12, 16 weeks)
- Different patient subgroups (men, women, under 50, over 50)
- Different outcome measures (anxiety, sleep, functional capacity)

After running 30+ analyses, one combination — anxiety at 8 weeks in women under 50 — shows p = 0.04. The paper is written claiming the drug reduces anxiety in young women, with 0.04 as the headline statistic.

Misled reader's conclusion: "This drug works for anxiety in young women — there is a statistically significant effect." A clinician might prescribe it to young anxious patients on this basis.

Correct conclusion: with that many tests run, finding ONE result at p = 0.04 is exactly what we would expect by chance even if the drug does nothing. The "significance" of 0.04 should be corrected for multiple testing — under a Bonferroni correction with 30 tests, the threshold becomes 0.05 / 30 = 0.0017. p = 0.04 is far above that. The honest conclusion is: this trial did not provide evidence that the drug works, including for anxiety in young women.

Red flags for spotting it:
- A paper reports a positive finding in a SUBGROUP without reporting the primary pre-registered outcome, OR reports the primary outcome was negative and then "explores" subgroups
- Many statistical tests are reported, but corrections for multiple comparisons are absent or hand-waved
- The reported effect lacks a clear pre-specification — it appears to be discovered, not predicted
- The effect is dramatic in the highlighted subgroup but absent in the broader sample, with no plausible biological reason for the specificity
- Pre-registration of the analysis plan is the most reliable defense; readers should look for whether the study was pre-registered (e.g., on clinicaltrials.gov) and whether the reported analysis matches the registered one

Misuse 2: Simpson's Paradox

Brief explanation: an apparent trend in aggregated data reverses when the data are broken down by relevant subgroups. The aggregation conceals a confounding variable that drives the misleading overall pattern.

Concrete example: a state is comparing the success rates of two surgical centers, A and B, for kidney stone treatment.

Aggregate results: Center A succeeded in 73% of cases (273 of 350); Center B succeeded in 83% of cases (289 of 350). Center B looks clearly better.

But the cases were not equivalent. Kidney stones come in two sizes: small (easier to treat) and large (harder to treat). Breaking the data down:
- Small stones: Center A succeeded in 81 of 87 cases (93%); Center B succeeded in 234 of 270 cases (87%). Center A is better at small stones.
- Large stones: Center A succeeded in 192 of 263 cases (73%); Center B succeeded in 55 of 80 cases (69%). Center A is also better at large stones.

The paradox: Center A is better in EACH category, yet Center B has a higher overall success rate. The reason: Center A treats mostly large (hard) stones, while Center B treats mostly small (easy) stones. Center B's aggregate looks better only because it treats easier cases. This is a real example, drawn from a 1986 study in the British Medical Journal, often used to illustrate Simpson's Paradox.

Misled reader's conclusion: "Center B is the better hospital for kidney stones." A patient choosing where to go for treatment would pick Center B based on the aggregate, possibly missing that Center A is better for whatever stone they actually have.

Correct conclusion: Center A has higher success rates for both small and large stones; the appropriate measure depends on the patient's actual stone type. The aggregate is misleading because the case mixes are different.

Red flags for spotting it:
- A comparison between groups with no breakdown by relevant subgroups
- The groups are known to differ in ways that affect the outcome (case mix, demographics, baseline conditions)
- A small effect in the wrong direction is being announced as decisive
- When you ask "what subgroups exist within this comparison?" and there are obvious answers, the absence of subgroup analysis is suspicious
- Healthcare comparisons, school comparisons, and policy comparisons across heterogeneous populations are particularly prone to Simpson's — always check if the populations being compared are actually comparable

Why This Is a Model Response

The p-hacking example is detailed enough that the reader can follow exactly how the misuse was committed. The list of secondary analyses (sub-scales, time points, subgroups) makes the multiple-testing problem visceral.

The Bonferroni correction is mentioned correctly. With 30 tests, the threshold falls to about 0.0017, which p = 0.04 does not meet. The student knows the standard fix.

The Simpson's paradox example is taken from real medical literature, with realistic numbers that actually exhibit the paradox. Many textbook treatments use contrived examples; the kidney stone case is documented in the BMJ.

The red flags for each misuse are concrete and actionable. "Look for pre-registration" and "ask what subgroups exist" are practical reading habits, not vague advice.

Both misuses connect to current concerns in applied science. P-hacking is a major driver of the replication crisis; Simpson's paradox underlies a great deal of misleading public-policy discourse, from college admissions data to mortality comparisons across hospitals.`,
  },
  {
    id: "d7",
    number: 12,
    title: "Discussion 7: Reading and Critiquing a Published Study",
    points: 50,
    type: "discussion",
    objectives: [
      "Apply an eight-item checklist to evaluate a published quantitative study or news article reporting one.",
      "Render a calibrated overall judgment of how much to trust a headline statistical claim, and identify what additional evidence would change that judgment.",
    ],
    reading: `Background

A statistically literate person should be able to read a published study — or a news article reporting one — and form an informed judgment about how much to trust the findings. This is not the same as understanding every technical detail. It means being able to ask the right questions.

A short checklist for evaluating any quantitative study:

1. WHAT IS THE QUESTION the study is trying to answer? Is it a descriptive question (how prevalent is X?), a comparative question (do people in group A differ from people in group B?), or a causal question (does X cause Y)? Causal questions require more rigorous designs than descriptive ones.

2. WHO WERE THE PARTICIPANTS, AND HOW WERE THEY RECRUITED? Random sample of the relevant population? Convenience sample of college students? Self-selected from an online forum? The recruitment determines what population the conclusions can validly apply to.

3. HOW WAS THE STUDY DESIGNED? Observational or experimental? If experimental, was random assignment used? Was there blinding? What was the comparison group? An observational study can describe associations; only a well-controlled experiment can identify causes.

4. WHAT WAS MEASURED, AND HOW? Were the outcome measures validated and standardized, or ad hoc? Self-report or objective measurement? Single time point or longitudinal? Bad measurement produces noise that no fancy statistics can clean up.

5. WHAT IS THE EFFECT SIZE? Not just whether p is below some threshold, but how big the effect is in real terms. A "statistically significant" 1-point improvement on a 100-point test may be detectable but unimportant.

6. WHAT ARE THE LIMITATIONS the authors themselves acknowledge? Honest authors discuss their study's weaknesses; cherry-picked or motivated studies often skip this section or treat it cursorily.

7. HAVE THESE FINDINGS REPLICATED in other studies? A single study, especially with a small sample, is suggestive but not definitive. Replicated findings across multiple labs and populations are far more credible.

8. WHO FUNDED THE STUDY, AND WHAT INCENTIVES MIGHT BIAS IT? A drug trial funded by the drug's manufacturer is not automatically wrong, but its findings should be viewed with extra scrutiny — and meta-analyses consistently show that industry-funded trials are more likely to find favorable results than independently funded trials of the same drug.

A study can be flawed in any of these dimensions. The goal is not to find a perfect study (no study is perfect) but to weigh the credibility of the findings appropriately given the strengths and weaknesses.`,
    assignment: `Assignment (50 points)

Choose ONE published study or major news article reporting a statistical claim. (Real ones are best — pick something from a recent newspaper, magazine, or scientific journal you have read. If you cannot find one, you may invent a plausible scenario based on real research patterns.) Then:

1. Briefly summarize the study's main claim
2. Walk through at least FIVE of the eight checklist items above, addressing each as it applies to your chosen study
3. Render an overall judgment: how much should a reader trust the headline claim, and what would change your level of trust?
4. Suggest ONE follow-up study that would address a key weakness you identified`,
    modelResponse: `Model Response

Study chosen: a 2018 study that received substantial press coverage, claiming that "moderate alcohol consumption reduces the risk of cardiovascular disease."

Main claim: people who drink small to moderate amounts of alcohol (one drink per day for women, two for men) have lower rates of heart disease than non-drinkers, suggesting that moderate drinking is protective.

Walking through the checklist:

1. WHAT IS THE QUESTION? This is a CAUSAL claim — moderate alcohol consumption REDUCES cardiovascular disease risk. The use of "protective" implies a causal mechanism. This kind of claim requires causal evidence, not just correlational evidence.

2. WHO WERE THE PARTICIPANTS? The studies underlying this claim are typically observational cohort studies — large groups (tens of thousands of people) followed over time. Participants are recruited from sources like nurses' health registries, government workers' panels, or population samples in epidemiologic studies. They are not random samples of the general population — they are people willing and able to participate in long-term health research, who tend to be wealthier, healthier, and more health-conscious than the population at large.

3. HOW WAS THE STUDY DESIGNED? OBSERVATIONAL, not experimental. Researchers measured alcohol consumption (typically by self-report) and tracked cardiovascular outcomes over years. There was NO random assignment to drinking groups, because that would be unethical and impractical. This is the central problem with the study.

4. WHAT WAS MEASURED, AND HOW? Alcohol consumption was self-reported, often using food-frequency questionnaires asking participants to estimate their typical weekly intake. Self-report of alcohol is notoriously unreliable — people underreport their drinking, especially heavier drinkers. The "moderate" category includes people with very different actual consumption patterns. Cardiovascular outcomes (heart attack, stroke, cardiovascular death) are usually measured more reliably through medical records.

5. WHAT IS THE EFFECT SIZE? In typical studies of this kind, moderate drinkers show about a 25–30% lower rate of cardiovascular events than non-drinkers. This is a meaningful effect IF causal, but a 25% reduction in a low-base-rate outcome is exactly the kind of effect that small confounding can produce.

6. WHAT ARE THE LIMITATIONS? The most important one — usually buried in the discussion section — is the "abstainer bias" problem. The "non-drinkers" comparison group includes a heterogeneous mix: lifelong abstainers (often religious, healthy), former drinkers who quit because of health problems, people with conditions that prevent drinking. The last category is full of sick people. So when we compare drinkers to "non-drinkers," we are partly comparing healthy people to sick people, regardless of alcohol's actual effect.

7. HAVE THESE FINDINGS REPLICATED? Across many cohort studies, yes — the J-shaped curve (low risk for moderate drinkers, higher risk for non-drinkers and heavy drinkers) is a consistent observational finding. But more recent studies that try to address the abstainer-bias problem and other confounders find substantially smaller protective effects, or none at all. A 2022 reanalysis using more sophisticated methods reduced the apparent benefit nearly to zero. The replication picture is therefore mixed: the surface pattern replicates, but the causal interpretation does not.

8. WHO FUNDED IT? Many of the early alcohol-and-heart studies were funded with at least partial alcohol-industry money. The 2018 NIH-funded MACH study (Moderate Alcohol and Cardiovascular Health) — which would have been a randomized trial — was canceled in 2018 when an internal investigation revealed extensive industry involvement in study design and an apparent expectation among industry funders that the trial would produce favorable results.

Overall judgment: a reader should NOT take "moderate alcohol is heart-healthy" as established fact. The pattern is real in observational data, but the most likely explanation involves abstainer bias and other confounding rather than a true causal benefit. The conclusion that should reach the public is: "moderate drinking is associated with lower heart disease rates, but this association largely or entirely reflects characteristics of the people who drink moderately rather than effects of the alcohol itself." The press coverage routinely overstates the strength of evidence and the implied policy advice.

What would change my trust: a well-conducted RCT randomizing participants to moderate drinking vs. abstention, with adequate sample size and long follow-up. The MACH study would have been such a trial; its cancellation leaves us without strong causal evidence. Mendelian randomization studies — which use genetic variants associated with alcohol metabolism as natural experiments — have published in the past decade and generally find smaller protective effects than observational studies, supporting the abstainer-bias explanation.

Follow-up study: an analysis using Mendelian randomization with a very large sample (UK Biobank, for example, has over 500,000 participants with genetic data and health outcomes). Compare cardiovascular disease rates across genetic variants associated with high vs. low alcohol consumption. Because genetic variants are randomly assigned at conception, this approximates an RCT for alcohol consumption without ethical or practical barriers. Several such studies have already been published, and they generally find that the apparent cardiovascular benefit of moderate drinking is reduced or eliminated when this method is used.

Why This Is a Model Response

The student picks a real, contested claim with substantial public-health implications. The alcohol-and-heart story has been a fixture of nutrition journalism for decades, and most Americans have heard it.

Walking through the checklist surfaces the central methodological flaw (observational design) AND a specific confounder (abstainer bias) that is widely discussed in the relevant epidemiologic literature.

The student updates the picture beyond the original 2018 framing, incorporating the 2022 reanalyses that found smaller or no benefit. This is what serious reading does: it tracks how a claim has held up.

The funding observation is concrete and recent — the MACH study cancellation in 2018 is well-documented and shows that industry influence is not just a theoretical concern.

The follow-up suggestion (Mendelian randomization) is technically sophisticated for a 101 student to mention, but it represents a real alternative methodology that has produced influential results in this exact debate. Even mentioning that such methods exist demonstrates above-average statistical literacy.`,
  },
  {
    id: "tp",
    number: 13,
    title: "Term Paper: Outline + Final Paper",
    points: 200,
    type: "termpaper",
    objectives: [
      "Identify five real-world statistical claims spanning different domains, and outline a calibrated evaluation of each.",
      "Write full evaluations of all five claims using the standard sequence (claim, source, course concepts, questions, judgment, what would change it) and the analytic vocabulary of the course.",
    ],
    reading: `Background — Term Paper Outline (100 points)

You have spent the term acquiring a vocabulary and a habit of mind: distinguish data types, choose appropriate measures of center and spread, visualize before computing, watch for confounders, separate correlation from causation, mistrust unreplicated single studies. The term paper asks you to apply this toolkit to claims you encounter in the world.

A statistical evaluation of a real-world claim follows a standard sequence:
1. State the claim precisely
2. Identify the source and what evidence is presented for the claim
3. Identify the type of question (descriptive, comparative, causal) and what evidence would be needed to support it
4. Apply the relevant concepts from the course (sampling, confidence, hypothesis testing, correlation vs. causation, common misuses)
5. Render a calibrated judgment about how much to trust the claim
6. Identify what additional evidence would change your judgment

Background — Term Paper (100 points)

Now you write the full evaluations of the five claims you outlined. Each evaluation should be approximately 600 words and follow the standard sequence:
1. State the claim precisely
2. Identify the source and evidence base
3. Apply the relevant concepts from the course
4. Walk through the most important questions a literate reader would ask
5. Render a calibrated judgment
6. Identify what would change your judgment

The point is not to debunk every claim but to evaluate each one fairly. Some of the five claims will turn out to be reasonably well-supported; others will not. Statistical literacy is calibrated — not dismissive of evidence, not credulous of marketing.`,
    assignment: `PHASE 1 — Term Paper Outline (100 points)

Your term paper will deliver short statistical evaluations (about 600 words each) of five claims you might encounter in the news, in advertising, or in everyday discourse. For this outline assignment, you must identify the five claims and produce a one-page outline for each, but not yet write the full evaluations.

You will evaluate the following five claims:
1. A health-product advertisement: "Studies show that our supplement increases energy by 50%." (You will identify a real specific advertisement, or a closely-modeled fictional one, and evaluate the underlying claim.)
2. A widely-reported correlation: "Children who eat breakfast perform better in school." (Real and widely covered. You will assess whether the causal interpretation is supported.)
3. A criminal-justice statistic: "X% of crimes are committed by people in [demographic group]." (You will pick a specific real-world statistic of this form — there are many — and evaluate how the statistic is constructed and whether common interpretations are valid.)
4. A polling claim: "Polls show [Candidate / policy position] has [percentage] support." (You will pick a real recent poll and assess its sampling, margin of error, and the limits of the inference.)
5. A medical screening or diagnostic claim: "If you test positive on test X, your probability of having condition Y is Z%." (You will pick a real screening test — mammography, prostate-specific antigen, COVID rapid test, or similar — and evaluate the claim using base-rate reasoning.)

For EACH of the five claims, write an outline that contains:
- The claim, restated precisely
- The likely source and evidence base
- Which concepts from the course are most relevant (correlation vs. causation, sampling bias, multiple testing, base rate, confidence interval, etc.)
- Two to three specific questions you would want answered to evaluate the claim
- A tentative judgment: how much should this claim be trusted, on a scale from "well-supported" to "very weak"?

Do NOT write the full evaluations in Phase 1. Those are Phase 2.

PHASE 2 — Term Paper (100 points)

Write full evaluations of all five claims from your outline. For each:
- Follow the standard sequence above
- Use the technical vocabulary of the course (confidence intervals, p-values, base rates, confounding, replication, etc.) appropriately
- Reach a calibrated judgment, not a one-word verdict
- Cite at least one specific real-world fact, study, or example for each claim

Submit Phase 1 and Phase 2 together in a single submission, clearly labeled. Phase 1 outlines first, then Phase 2 full evaluations.`,
    modelResponse: `Model Response — Phase 1: Outlines

Outline 1 — A Supplement Advertisement

Claim: "Our supplement increases energy by 50% — verified in clinical studies." Specific reference: a fictional but realistic wellness brand selling a multi-ingredient herbal blend, with marketing on social media and a product page citing one or two studies.

Likely source and evidence base: typically these claims are supported by either (a) a single small unblinded study funded by the company, with self-reported outcomes, or (b) studies on individual ingredients (e.g., caffeine's well-established effects on alertness) extrapolated to the proprietary blend.

Relevant course concepts: small sample sizes; lack of randomization or blinding; self-report measurement of vague outcomes ("energy"); selection of subjects (often paid product testers); the difference between effects on isolated ingredients vs. effects of a proprietary blend; the meaning of "energy" — is it a real construct or marketing language?

Questions to ask: Was the study published in a peer-reviewed journal, or only on the company's website? Was it randomized and blinded? Was the comparison group given an inert placebo, or a different active ingredient? How was "energy" measured, and is the measurement validated?

Tentative judgment: very weak. Almost all "energy supplement" claims of this form fail to replicate under independent investigation, and the underlying construct ("energy") is so vague that almost any study can produce a positive-looking result with the right framing.

Outline 2 — Breakfast and School Performance

Claim: children who eat breakfast perform better academically than children who do not. Often reported as supporting school breakfast programs.

Likely source and evidence base: a body of observational studies finding correlations between self-reported breakfast eating and grades, test scores, or attendance. The correlation is real and replicates. The causal interpretation is what is contested.

Relevant course concepts: correlation vs. causation; confounding (parental income, parental involvement, household stability, sleep, general health); reverse causation (well-rested, well-supported children eat breakfast AND do well in school for the same underlying reasons); the gap between observational and experimental findings; effect sizes from RCT vs. observational studies.

Questions to ask: have RCTs been done in which schools randomly assigned breakfast programs? What did those find compared to the observational studies? What demographic factors were controlled for? Are improvements consistent across socioeconomic groups, or concentrated in undernourished children specifically?

Tentative judgment: partially supported but overstated. The correlation is real; the causal interpretation is more nuanced. RCTs of school breakfast programs find smaller effects than observational studies suggest, with the largest benefits among children who would otherwise be undernourished.

Outline 3 — A Criminal-Justice Demographic Statistic

Claim: a frequently cited federal statistic about which demographic groups commit which fraction of various crimes, often presented in political contexts.

Likely source and evidence base: FBI Uniform Crime Reporting (UCR) and Bureau of Justice Statistics data. The raw numbers are typically arithmetically accurate but require careful interpretation.

Relevant course concepts: arrest data vs. offending data (arrests measure police activity, not crime); per-capita normalization; Simpson's paradox when populations differ in geography or socioeconomic status; selection effects in policing intensity; the difference between aggregate statistics and like-for-like comparisons; survey data alternatives like the National Crime Victimization Survey.

Questions to ask: is the statistic based on arrests, convictions, or victim-reported offenses? What controls have been applied for age, urbanicity, and socioeconomic status? When restricted to comparable populations, what is the size and direction of the difference?

Tentative judgment: arithmetic usually correct; common interpretations usually wrong. The headline form supports many narratives depending on framing. A literate reader demands per-capita rates, controlled comparisons, and alternative data sources before accepting any inference.

Outline 4 — A Recent Election Poll

Claim: a poll three weeks before an election shows Candidate A leading Candidate B 51% to 47%, ±3% margin of error.

Likely source and evidence base: a national poll of about 1,000 likely voters by phone and online, conducted by a reputable polling organization with weighting for demographics and likely-voter screens.

Relevant course concepts: confidence intervals (the margin of error is roughly the half-width of a 95% CI); margin of error for differences (larger than for individual percentages); sampling and non-response bias; mode effects (phone vs. online); the difference between snapshot and prediction; historical polling errors in 2016 and 2020.

Questions to ask: what was the response rate? What likely-voter screen was used? What weighting was applied? Are there other recent polls, and how do they compare? When was the field period?

Tentative judgment: moderately supported as a snapshot estimate of opinion at the time of the poll. The 4-point lead is at or near the edge of statistical significance — well within historical polling error in close races. A statistically literate reader treats the lead as suggestive of an advantage rather than a confident prediction. The 2016 and 2020 elections both produced polling results that proved further from the actual outcomes than the stated margins of error suggested.

Outline 5 — A Medical Screening Test

Claim: a friend forwarded an article saying that an at-home cancer screening test "detects cancer with 95% accuracy." If you test positive, what is the probability you actually have cancer?

Likely source and evidence base: marketing copy for an actual at-home test. The 95% figure typically refers to either sensitivity or specificity (or both), without specifying.

Relevant course concepts: base rates; sensitivity and specificity; positive predictive value and how it depends dramatically on the prevalence of the disease in the tested population; the asymmetry between screening (in low-risk populations, the PPV of positive tests is low) and diagnostic testing (in high-risk populations the PPV rises).

Questions to ask: what is the actual prevalence of this cancer in the population being marketed to (e.g., 50-year-olds vs. 20-year-olds)? What are sensitivity and specificity individually? What does the company recommend if a customer tests positive — biopsy, repeat testing, doctor visit?

Tentative judgment: weakly supported as marketed. The "95% accuracy" framing obscures that, for rare cancers in low-risk populations, most positive results will be false positives. The test may have a role as one component of a screening strategy, but the marketing's implicit claim — "a positive test means you probably have cancer" — is statistically wrong. Apply the same Bayesian reasoning from Discussion 3 and the truth becomes clear.

Why This Is a Model Outline

The five claims span different domains (consumer products, education, criminal justice, politics, healthcare) so the term paper cannot be approached with a single rote critique.

Each outline correctly identifies the most relevant course concepts. Election polling triggers confidence intervals; medical screening triggers base rates; advertising claims trigger study design and replication.

The questions to ask are specific and actionable, not vague. "What was the response rate?" and "What is the actual prevalence?" are real questions a reader can pursue.

The tentative judgments are calibrated. The student does not say "this is true" or "this is false" but ranks credibility on a spectrum and identifies what would shift the judgment.

The choices reflect the genuine landscape of statistical claims a community-college or first-year college student will encounter. None of the five is a textbook puzzle; all are real.

Model Response — Phase 2: Full Evaluations

Evaluation 1 — A Supplement Advertisement

The claim: a popular online wellness brand markets a multi-ingredient herbal supplement with the promise that "users report a 50% increase in energy" and references "clinical studies" as supporting evidence.

Source and evidence base: the supporting study, when one can be located, is typically a small (n = 20 to 60) unblinded trial conducted by the manufacturer or an affiliated lab, with self-reported outcomes on a vague "energy scale" administered before and after a few weeks of use. The study is not registered, not peer-reviewed, and not published in any indexed medical journal — it appears only on the company's website.

Applying course concepts: the methodological problems are textbook. With no blinding, both participants and researchers know who took the supplement, allowing placebo effects and observer bias to inflate apparent effects. With no randomization, there is no genuine control group. With self-reported outcomes on a vague construct ("energy"), the measurement noise alone could account for the reported 50% increase. The sample is small enough that even modest noise can produce a sizable apparent effect, and selective reporting (publishing the study only if it shows a positive result) means the published version may be one of several attempts.

Important questions: was the study pre-registered? Is the study available in full, with raw data and analytic code? Was the comparison group given an inert placebo or no treatment at all? What is the sample size — is it large enough to detect anything below an enormous effect? What is the publication source? What are the credentials and independence of the researchers? What did peer review, if any, conclude?

Calibrated judgment: this claim is very weakly supported. Energy supplement claims of this form rarely survive independent replication. The Cochrane Collaboration, which performs systematic reviews of medical evidence, has repeatedly concluded that proprietary "energy" supplement blends show no consistent benefit beyond what caffeine alone provides. The 50% improvement figure is almost certainly a combination of placebo effect, regression to the mean, and selective reporting. A literate reader should treat this claim as marketing language with the burden of proof on the manufacturer.

What would change the judgment: a randomized double-blind placebo-controlled trial published in a reputable peer-reviewed journal, with pre-registered analysis, validated outcome measures, and replication in independent labs. Failing that, a systematic review showing a consistent effect across multiple smaller studies would be moderately persuasive. Neither exists for the typical proprietary energy blend.

Evaluation 2 — Breakfast and School Performance

The claim: eating breakfast improves children's school performance.

Source and evidence base: dozens of observational studies, conducted across multiple decades and countries, consistently find that children who report eating breakfast have higher grades, higher test scores, and lower absenteeism than children who report skipping breakfast. The correlation is robust. The causal interpretation is the contested part.

Applying course concepts: this is a textbook correlation-vs-causation case. Several confounders are obvious. Children who eat breakfast tend to come from families with more financial resources, more stable home routines, more parental involvement, and better overall health. All of these independently contribute to academic performance. Children skipping breakfast may be doing so because they are overwhelmed in the morning, food-insecure, or in households with chaotic routines — and any of these factors could affect grades for reasons unrelated to breakfast. There is also a reverse-causation concern: well-rested, less anxious children both eat breakfast AND perform well, with the same underlying cause (a stable home environment) producing both.

Important questions: have randomized controlled trials been done? What did those find compared to observational results? Are improvements concentrated in particular subgroups (food-insecure children) or distributed across all children? What is the effect size in RCTs vs. observational studies?

Calibrated judgment: the breakfast-and-performance correlation is real. The causal claim is partially supported but overstated in popular media. RCTs of school breakfast programs have generally found smaller effects than the observational studies suggested, with the largest benefits concentrated among children who would otherwise be food-insecure or undernourished. A 2014 systematic review by Adolphus, Lawton, and Dye found modest effects on attention and cognition for children who were undernourished, with weaker and inconsistent effects for already-fed children. The honest summary: providing breakfast to children who would otherwise go hungry plausibly improves their performance; the broader claim that "everyone should eat breakfast for academic reasons" is not well-supported.

What would change the judgment: more high-quality RCTs would help, especially ones examining whether universal breakfast programs (rather than targeted ones) produce population-level improvements. The Mendelian randomization approach is harder here because there are no obvious genetic instruments for breakfast eating, but natural experiments (sudden policy changes that create exposed and unexposed cohorts) could supply additional causal evidence.

Evaluation 3 — A Criminal-Justice Demographic Statistic

The claim: a frequently cited federal statistic about which demographic groups commit which fraction of various crimes, often presented in political contexts as evidence of group-level criminality.

Source and evidence base: FBI Uniform Crime Reporting (UCR) and Bureau of Justice Statistics data. The raw numbers — drawn from arrest reports submitted by local jurisdictions — are typically arithmetically accurate but require careful interpretation.

Applying course concepts: several issues. First, arrest data measure ARRESTS, not OFFENSES; police presence and policing intensity vary substantially by neighborhood, and over-policed areas produce more arrests for the same underlying offending behavior. This is a selection effect in the data collection. Second, raw counts must be normalized by population size — saying "X% of arrests are from group Y" without per-capita normalization invites Simpson's paradox, especially when group Y is concentrated in different geographic and economic conditions than other groups. Third, the proper comparison is across like populations: comparing urban-to-urban or socioeconomic-stratum-to-stratum reveals smaller and sometimes reversed differences than aggregate national statistics. Fourth, charge severity, prosecutorial discretion, and conviction rates introduce additional layers of selection.

Important questions: are these arrest counts, conviction counts, or self-reported offending rates from victimization surveys (which avoid policing-intensity bias)? What controls have been applied for age, urbanicity, and socioeconomic status? When restricted to comparable populations, what is the size and direction of the differences? What does the National Crime Victimization Survey — which asks victims to report perpetrator characteristics, independent of police arrest decisions — show?

Calibrated judgment: the raw statistics are usually arithmetically correct but routinely misused. The headline form ("X% of crimes are committed by Y group") collapses several different things — arrest rates, offending rates, demographic distributions, geographic distributions — into a single number that supports almost any narrative depending on framing. A statistically literate reader recognizes that the claim, even if numerically true, does not support most of the inferences typically drawn from it. The Bureau of Justice Statistics itself publishes more sophisticated analyses, and these tell a more nuanced story than the soundbite version. The appropriate response to such claims is not to accept or reject them, but to demand the next level of detail (per-capita rates, controlled comparisons, alternative data sources like victimization surveys).

What would change the judgment: the context determines the trust level. A claim that has been carefully analyzed by criminologists, with appropriate controls and acknowledgment of limitations, is more credible than a soundbite. Multiple data sources (arrest data plus victimization surveys plus self-report studies) converging on a similar picture would be more credible than any one source alone.

Evaluation 4 — A Recent Election Poll

The claim: a national poll conducted three weeks before an election shows Candidate A leading Candidate B 51% to 47%, with margin of error ±3%.

Source and evidence base: the poll surveyed approximately 1,000 likely voters by phone and online, conducted by a reputable polling organization. Response rate, weighting methodology, and full crosstabs are typically available on the polling firm's website.

Applying course concepts: the ±3% margin of error is roughly the half-width of a 95% confidence interval for an individual percentage. So the 51% support for A is best interpreted as "between 48% and 54%," and the 47% for B as "between 44% and 50%." The 4-point LEAD has a larger margin of error — typically about ±4% to ±5% — because the difference of two estimates accumulates the uncertainty of both. A 4-point lead with a 4% margin of error is at the edge of statistical significance: it suggests a real lead, but barely. Beyond the margin of error, polling errors include non-response bias (people willing to answer pollsters may differ from non-responders), likely-voter screens (the poll tries to predict who will actually vote, which is itself an estimation problem), and mode effects (phone vs. online responses differ).

Important questions: what was the response rate (lower is more concerning)? What likely-voter screen was used? What weighting was applied (some weighting can correct for known sampling problems; over-aggressive weighting can create new ones)? When was the field period — has anything happened since the poll was completed? Are there other recent polls, and how do they compare?

Calibrated judgment: a single 4-point lead is suggestive but not decisive. Historical polling errors, even from the best firms, have exceeded the stated margin of error in close races — most notably in 2016 (where state-level polls underestimated Trump support) and 2020 (where polls overestimated Biden support in several states). A reader should interpret "Candidate A leads by 4 points" as "Candidate A is probably ahead, but by an uncertain amount that could plausibly be anywhere from a tie to a 7-or-8 point lead." Polling aggregators (FiveThirtyEight, RealClearPolitics) attempt to combine multiple polls to reduce variance, and aggregate leads of 4 points historically translate into actual margins anywhere from a tie to 6 or 7 points.

What would change the judgment: multiple polls from independent organizations all showing similar leads would substantially increase confidence. A single outlier poll, even with low margin of error, should not be taken as definitive. The closer to election day, the smaller the time-decay of the snapshot. And state-level polls (rather than national popular vote) matter more for the actual electoral outcome in U.S. presidential races.

Evaluation 5 — A Medical Screening Test

The claim: an at-home cancer screening test detects cancer "with 95% accuracy." A user testing positive concludes they probably have cancer.

Source and evidence base: the test's marketing materials cite a 95% sensitivity (correctly identifies people with the cancer) and 95% specificity (correctly identifies people without it). These are reasonable for some screening tests but vary across cancers and tests.

Applying course concepts: this is the base-rate problem from Discussion 3. The "95% accuracy" framing conceals that the meaningful question — given a positive result, how likely is cancer? — depends on the prevalence of the cancer in the population taking the test. Suppose the cancer affects 1% of the screening population. Imagine 10,000 people taking the test. We expect 100 actual cancer cases (1%). With 95% sensitivity, 95 of these 100 will test positive (true positives). With 95% specificity, 95% of the 9,900 healthy people will correctly test negative — but 5% will test positive, that is 495 false positives. Total positives: 95 + 495 = 590. Of these, only 95 actually have cancer. Probability of cancer given positive test: 95 / 590 ≈ 16%. The "95% accurate" test gives a positive result that is only about 16% likely to be a true cancer detection. The other 84% are false positives.

Important questions: what is the actual prevalence of this cancer in the marketed population? What are sensitivity and specificity individually (not just an "accuracy" number)? What does the company recommend after a positive result — repeat testing, biopsy, doctor visit, or treatment? Is the test FDA-approved, and if so, for what indications?

Calibrated judgment: the headline marketing claim is statistically weak as typically presented. The "95% accuracy" number, even if accurate as a property of the test, does not support the implied conclusion that a positive result means probable cancer. For most cancers in average-risk populations, a positive screening result is a strong reason to follow up with a confirmatory test (often a biopsy or a more specific imaging test) — but it is NOT a diagnosis. Direct-to-consumer cancer screening tests have repeatedly run into trouble for marketing implying that positive results are diagnoses, leading to anxiety, unnecessary procedures, and sometimes treatment of cancers that were never there. A statistically literate consumer should: (a) understand the base-rate adjustment that converts test accuracy to predictive value, (b) treat a positive result as a reason for follow-up rather than a verdict, and (c) ask the manufacturer about positive predictive value in the relevant population, not just sensitivity and specificity.

What would change the judgment: a test with very high specificity (much higher than 95%) used in a higher-risk population (where prevalence is 10%–30% rather than 1%) can have meaningful positive predictive value. The base rate is the lever. Tests targeting high-risk populations (women with strong family history of breast cancer, smokers screened for lung cancer) have much better PPV than the same tests applied to average-risk populations. Always ask: what is the test for, and who is it for?

Why This Is a Model Term Paper

Each evaluation follows the standard sequence (claim, source, course concepts, questions, judgment, what would change it) without becoming formulaic. The student varies emphasis based on what is most informative for each claim.

Real evidence appears throughout. The Adolphus systematic review on breakfast, the 2016 and 2020 polling surprises, the Bureau of Justice Statistics, the Cochrane systematic reviews — these are real institutions producing real findings, anchoring the evaluations to verifiable facts.

The judgments are calibrated, not binary. The supplement claim is "very weakly supported." The breakfast claim is "partially supported but overstated." The poll lead is "suggestive but not decisive." The screening test marketing is "statistically weak as typically presented." Each judgment names the level of trust appropriate to the evidence.

The "what would change the judgment" sections turn evaluation into prescription. The student does not just dismiss claims; they describe what evidence would shift their assessment. This is the disposition of a serious analyst.

The vocabulary of the course (sensitivity, specificity, confounding, base rate, confidence interval, replication, p-hacking) is used appropriately throughout — not as ornament, but as the analytic instruments that make the evaluations possible. A student who can produce work like this has achieved the kind of statistical literacy that a 101 course is meant to build.`,
  },
];

export function moduleById(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}
